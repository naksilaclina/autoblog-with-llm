import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

export default router; 