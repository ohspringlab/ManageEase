import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { TaskController } from '../controllers/task.controller';

const router = Router();

router.use(authenticate);

router.get('/', TaskController.getTasks);
router.post('/', [
  body('title').notEmpty().withMessage('Title is required')
], TaskController.createTask);
router.get('/:id', TaskController.getTask);
router.put('/:id', TaskController.updateTask);
router.patch('/:id/status', TaskController.updateTaskStatus);
router.delete('/:id', TaskController.deleteTask);

export default router;