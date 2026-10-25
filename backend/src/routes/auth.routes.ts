import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import { registerSchema, loginSchema, updateProfileSchema, addressSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), AuthController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), AuthController.login);
router.post('/logout', AuthController.logout);

router.get('/me', authenticate, AuthController.getMe);
router.put('/profile', authenticate, validate({ body: updateProfileSchema }), AuthController.updateProfile);
router.post('/addresses', authenticate, validate({ body: addressSchema }), AuthController.addAddress);
router.delete('/addresses/:id', authenticate, AuthController.deleteAddress);

export default router;
