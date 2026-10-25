import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { optionalAuth, authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { orderLimiter } from '../middleware/rateLimiter.middleware';
import { createOrderSchema, quoteOrderSchema } from '../validators/order.validator';

const router = Router();

// Calculate live price quote from DB before checkout
router.post('/quote', optionalAuth, validate({ body: quoteOrderSchema }), OrderController.quoteOrder);

// Create order (guest or authenticated devotee)
router.post('/', optionalAuth, orderLimiter, validate({ body: createOrderSchema }), OrderController.createOrder);

// User order history (requires login)
router.get('/user', authenticate, OrderController.getUserOrders);

// Single order details by id or order number
router.get('/:idOrNumber', optionalAuth, OrderController.getOrder);

export default router;
