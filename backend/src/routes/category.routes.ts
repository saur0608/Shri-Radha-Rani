import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const router = Router();

router.get('/', CategoryController.listCategories);
router.get('/:slug', CategoryController.getCategoryBySlug);

export default router;
