import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validate.middleware';
import { productQuerySchema } from '../validators/product.validator';

const router = Router();

router.get('/', validate({ query: productQuerySchema }), ProductController.listProducts);
router.get('/collections', ProductController.getCollections);
router.get('/search/suggestions', ProductController.getSuggestions);
router.get('/:slugOrId', ProductController.getProductBySlugOrId);

export default router;
