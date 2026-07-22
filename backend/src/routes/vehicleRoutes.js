import express from 'express';
import protect from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/roleMiddleware.js';
import {
  addVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { purchaseVehicle, restockVehicle } from '../controllers/inventoryController.js';

const router = express.Router();

// Get and search routes (defined first to prevent conflict with /:id parameter)
router.get('/', protect, getVehicles);
router.get('/search', protect, searchVehicles);

// CRUD routes
router.post('/', protect, adminOnly, addVehicle);
router.put('/:id', protect, adminOnly, updateVehicle);
router.delete('/:id', protect, adminOnly, deleteVehicle);

// Inventory action routes
router.post('/:id/purchase', protect, purchaseVehicle);
router.post('/:id/restock', protect, adminOnly, restockVehicle);

export default router;
