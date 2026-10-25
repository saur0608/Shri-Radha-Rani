import { z } from 'zod';

const indianPhoneRegex = /^[6-9]\d{9}$/;
const indianPincodeRegex = /^\d{6}$/;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  phone: z
    .string()
    .regex(indianPhoneRegex, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneVerificationToken: z.string().optional(),
  emailVerificationToken: z.string().optional(),
});

export const loginSchema = z.object({
  phoneOrEmail: z.string().min(1, 'Please enter your mobile number or email'),
  password: z.string().min(1, 'Password is required'),
});

export const sendOtpSchema = z.object({
  target: z.string().min(1, 'Target mobile number or email is required'),
  channel: z.enum(['SMS', 'EMAIL']).optional(),
  purpose: z.enum(['signup', 'login', 'checkout', 'reset', 'profile']),
});

export const verifyOtpSchema = z.object({
  target: z.string().min(1, 'Target mobile number or email is required'),
  otp: z.string().regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
  purpose: z.enum(['signup', 'login', 'checkout', 'reset', 'profile']),
});

export const otpLoginSchema = z.object({
  target: z.string().min(1, 'Please enter your mobile number or email'),
  otp: z.string().regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
});

export const resetPasswordSchema = z.object({
  target: z.string().min(1, 'Target mobile number or email is required'),
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().regex(indianPhoneRegex).optional(),
  email: z.string().email().optional(),
  phoneVerificationToken: z.string().optional(),
  emailVerificationToken: z.string().optional(),
});

export const addressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  phone: z.string().regex(indianPhoneRegex, 'Valid 10-digit mobile number required'),
  street: z.string().min(5, 'Detailed street address is required'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(indianPincodeRegex, 'Valid 6-digit Indian PIN code required'),
  isDefault: z.boolean().optional().default(false),
});

