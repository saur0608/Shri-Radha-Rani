import { z } from 'zod';

export const validateCouponSchema = z.object({
  code: z.string().min(2, 'Coupon code is required').trim(),
  subtotal: z.number().nonnegative('Subtotal cannot be negative'),
});

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20)
    .toUpperCase()
    .trim(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive('Discount value must be greater than zero'),
  minOrderAmount: z.number().nonnegative().default(0),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  startDate: z.string().datetime().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  endDate: z.string().datetime().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();
