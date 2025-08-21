import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import userRoutes from './user.routes'; // Add this

const router = Router();

router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is healthy', 
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth/*',
      tasks: '/api/v1/tasks/*',
      users: '/api/v1/users/*' // Add this
    }
  });
});

router.use('/v1/auth', authRoutes);
router.use('/v1/tasks', taskRoutes);
router.use('/v1/users', userRoutes); // Add this

export default router;
