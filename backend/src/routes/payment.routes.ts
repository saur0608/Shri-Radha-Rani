import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Create Razorpay Order
router.post('/razorpay/create-order', optionalAuth, PaymentController.createRazorpayOrder);

// Verify signature from frontend checkout
router.post('/razorpay/verify', optionalAuth, PaymentController.verifyRazorpayPayment);

// Razorpay Webhook (must receive raw or parsed body)
router.post('/razorpay/webhook', PaymentController.razorpayWebhook);

export default router;
