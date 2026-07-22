import request from 'supertest';
import app from '../src/app.js';
import * as dbHandler from './dbHandler.js';
import jwt from 'jsonwebtoken';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dealership_key_12345';

// Helper to generate auth headers
const getAuthHeaders = (userId, role = 'user') => {
  const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '1h' });
  return {
    Authorization: `Bearer ${token}`
  };
};

describe('Vehicles Endpoints', () => {
  let userHeaders;
  let adminHeaders;
  const mockUserMongoId = '663363363363363363363363';
  const mockAdminMongoId = '993399339933993399339933';

  beforeEach(() => {
    userHeaders = getAuthHeaders(mockUserMongoId, 'user');
    adminHeaders = getAuthHeaders(mockAdminMongoId, 'admin');
  });

  describe('GET /api/vehicles', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.statusCode).toEqual(401);
    });

    it('should return empty list if no vehicles exist', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set(userHeaders);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/vehicles', () => {
    const newVehicle = {
      make: 'Tesla',
      model: 'Model 3',
      category: 'Sedan',
      price: 45000,
      quantity: 5
    };

    it('should prevent non-admin user from adding a vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set(userHeaders)
        .send(newVehicle);
      expect(res.statusCode).toEqual(403);
    });

    it('should allow admin user to add a vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set(adminHeaders)
        .send(newVehicle);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.make).toEqual('Tesla');
      expect(res.body.price).toEqual(45000);
      expect(res.body.quantity).toEqual(5);
    });

    it('should return 400 if validation fails (negative price or quantity)', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set(adminHeaders)
        .send({ ...newVehicle, price: -100 });
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
      // Add some vehicle records for searching
      await request(app).post('/api/vehicles').set(adminHeaders).send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 20000, quantity: 3 });
      await request(app).post('/api/vehicles').set(adminHeaders).send({ make: 'Ford', model: 'F-150', category: 'Truck', price: 35000, quantity: 2 });
      await request(app).post('/api/vehicles').set(adminHeaders).send({ make: 'Toyota', model: 'RAV4', category: 'SUV', price: 28000, quantity: 4 });
    });

    it('should search by make', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Honda')
        .set(userHeaders);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].model).toEqual('Civic');
    });

    it('should search by category', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?category=Truck')
        .set(userHeaders);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].make).toEqual('Ford');
    });

    it('should filter by price range', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=25000&maxPrice=30000')
        .set(userHeaders);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].make).toEqual('Toyota');
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    let vehicleId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set(adminHeaders)
        .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 18000, quantity: 5 });
      vehicleId = res.body.id;
    });

    it('should allow admin to update details', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set(adminHeaders)
        .send({ price: 19500, quantity: 4 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.price).toEqual(19500);
      expect(res.body.quantity).toEqual(4);
    });

    it('should block non-admin from updating details', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set(userHeaders)
        .send({ price: 19500 });
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    let vehicleId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set(adminHeaders)
        .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 18000, quantity: 5 });
      vehicleId = res.body.id;
    });

    it('should block non-admin from deleting', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set(userHeaders);
      expect(res.statusCode).toEqual(403);
    });

    it('should allow admin to delete', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set(adminHeaders);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');

      // Verify not found in subsequent fetch
      const fetchRes = await request(app)
        .get('/api/vehicles')
        .set(userHeaders);
      expect(fetchRes.body.length).toEqual(0);
    });
  });
});
