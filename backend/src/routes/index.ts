import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy', version: '1.0.0' });
});

router.use('/v1/auth', authRoutes);
router.use('/v1/tasks', taskRoutes);

export default router;