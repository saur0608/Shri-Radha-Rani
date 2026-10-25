import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { optionalAuth, authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addToCartSchema, updateCartItemSchema, mergeCartSchema } from '../validators/cart.validator';

const router = Router();

router.get('/', optionalAuth, CartController.getCart);
router.post('/items', optionalAuth, validate({ body: addToCartSchema }), CartController.addItem);
router.put('/items/:itemId', optionalAuth, validate({ body: updateCartItemSchema }), CartController.updateQuantity);
router.delete('/items/:itemId', optionalAuth, CartController.removeItem);
router.delete('/', optionalAuth, CartController.clearCart);
router.post('/merge', authenticate, validate({ body: mergeCartSchema }), CartController.mergeCart);

export default router;
