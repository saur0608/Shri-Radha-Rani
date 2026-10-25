import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { OtpController } from '../controllers/otp.controller';
import { authenticate, requireVerifiedEmail } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addressSchema,
  sendOtpSchema,
  verifyOtpSchema,
  otpLoginSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// Dedicated Email-OTP Endpoints (Fully compatible with email-otp specification)
router.post('/email-otp/send', authLimiter, validate({ body: sendOtpSchema }), (req, res, next) => {
  req.body.channel = 'EMAIL';
  req.body.target = req.body.email || req.body.target;
  OtpController.sendOtp(req, res, next);
});
router.post('/email-otp/verify', authLimiter, validate({ body: verifyOtpSchema }), (req, res, next) => {
  req.body.channel = 'EMAIL';
  req.body.target = req.body.email || req.body.target;
  OtpController.verifyOtp(req, res, next);
});
router.get('/email-otp/session', requireVerifiedEmail(), (req, res) => {
  res.json({ success: true, verifiedEmail: req.verifiedEmail });
});

// Standard & Unified OTP Endpoints
router.post('/otp/send', authLimiter, validate({ body: sendOtpSchema }), AuthController.sendOtp);
router.post('/otp/verify', authLimiter, validate({ body: verifyOtpSchema }), AuthController.verifyOtp);
router.post('/otp/login', authLimiter, validate({ body: otpLoginSchema }), AuthController.loginWithOtp);
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), AuthController.resetPassword);

// Standard Auth Endpoints
router.post('/register', authLimiter, validate({ body: registerSchema }), AuthController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), AuthController.login);
router.post('/logout', AuthController.logout);

// Protected Profile & Address Endpoints
router.get('/me', authenticate, AuthController.getMe);
router.put('/profile', authenticate, validate({ body: updateProfileSchema }), AuthController.updateProfile);
router.post('/addresses', authenticate, validate({ body: addressSchema }), AuthController.addAddress);
router.delete('/addresses/:id', authenticate, AuthController.deleteAddress);

export default router;
