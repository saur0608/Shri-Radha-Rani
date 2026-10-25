import { z } from 'zod';

const indianPhoneRegex = /^[6-9]\d{9}$/;
const indianPincodeRegex = /^\d{6}$/;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  phone: z
    .string()
    .regex(indianPhoneRegex, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  phoneOrEmail: z.string().min(1, 'Please enter your mobile number or email'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
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
