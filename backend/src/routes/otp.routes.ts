import { Router } from 'express';
import { OtpController } from '../controllers/otp.controller';
import { validate } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import { sendOtpSchema, verifyOtpSchema } from '../validators/auth.validator';

const router = Router();

/**
 * @route   POST /api/otp/send
 * @desc    Send 6-digit OTP to ANY Indian mobile number or ANY email address
 * @access  Public
 */
router.post('/send', authLimiter, validate({ body: sendOtpSchema }), OtpController.sendOtp);

/**
 * @route   POST /api/otp/verify
 * @desc    Verify 6-digit OTP, mark verified, and return short-lived verification token
 * @access  Public
 */
router.post('/verify', authLimiter, validate({ body: verifyOtpSchema }), OtpController.verifyOtp);

export default router;
