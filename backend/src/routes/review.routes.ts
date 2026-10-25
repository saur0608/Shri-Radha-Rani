import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema, reviewQuerySchema } from '../validators/review.validator';

const router = Router();

router.get('/product/:productId', validate({ query: reviewQuerySchema }), ReviewController.listProductReviews);
router.post('/', authenticate, validate({ body: createReviewSchema }), ReviewController.createReview);

export default router;
