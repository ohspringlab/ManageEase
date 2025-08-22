import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { UserController } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);

export default router;
