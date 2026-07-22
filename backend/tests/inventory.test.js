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

describe('Inventory Endpoints', () => {
  let userHeaders;
  let adminHeaders;
  let vehicleId;
  const mockUserMongoId = '663363363363363363363363';
  const mockAdminMongoId = '993399339933993399339933';

  beforeEach(async () => {
    userHeaders = getAuthHeaders(mockUserMongoId, 'user');
    adminHeaders = getAuthHeaders(mockAdminMongoId, 'admin');

    // Create a vehicle to operate on
    const res = await request(app)
      .post('/api/vehicles')
      .set(adminHeaders)
      .send({ make: 'Honda', model: 'Accord', category: 'Sedan', price: 25000, quantity: 2 });
    vehicleId = res.body.id;
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should allow any authenticated user to purchase, reducing quantity by 1', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set(userHeaders);

      expect(res.statusCode).toEqual(200);
      expect(res.body.quantity).toEqual(1);
    });

    it('should return 400 if user tries to purchase an out-of-stock vehicle', async () => {
      // Purchase twice to reduce quantity to 0
      await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set(userHeaders);
      await request(app).post(`/api/vehicles/${vehicleId}/purchase`).set(userHeaders);

      // Third purchase should fail
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set(userHeaders);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).post(`/api/vehicles/${vehicleId}/purchase`);
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should allow admin to restock increasing quantity', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set(adminHeaders)
        .send({ quantity: 5 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.quantity).toEqual(7); // 2 + 5
    });

    it('should block non-admin from restocking', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set(userHeaders)
        .send({ quantity: 5 });
      expect(res.statusCode).toEqual(403);
    });

    it('should return 400 if invalid quantity is provided (negative or zero)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set(adminHeaders)
        .send({ quantity: -2 });
      expect(res.statusCode).toEqual(400);
    });
  });
});
