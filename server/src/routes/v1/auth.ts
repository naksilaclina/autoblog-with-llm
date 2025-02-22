import { Router } from 'express';
import { UserController } from '../../controllers/auth/UserController';
import { authenticate } from '../../middlewares/auth/authenticate';

const router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/profile', authenticate, userController.updateProfile);
router.post('/api-key', authenticate, userController.generateApiKey);

export default router; 