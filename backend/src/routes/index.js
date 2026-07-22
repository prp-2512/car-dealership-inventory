import express from 'express';
import authRoutes from './authRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);

export default router;
