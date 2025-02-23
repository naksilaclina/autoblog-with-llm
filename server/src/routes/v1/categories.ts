import { Router } from 'express';
import { CategoryController } from '../../controllers/categories/CategoryController';
import { authenticate } from '../../middlewares/auth/authenticate';

const router = Router();
const categoryController = new CategoryController();

router.use(authenticate);

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router; 