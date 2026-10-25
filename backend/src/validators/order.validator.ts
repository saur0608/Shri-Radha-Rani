import { z } from 'zod';

const indianPhoneRegex = /^[6-9]\d{9}$/;
const indianPincodeRegex = /^\d{6}$/;

export const orderShippingAddressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  phone: z.string().regex(indianPhoneRegex, 'Please enter a valid 10-digit mobile number'),
  street: z.string().min(5, 'Full street address is required'),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(indianPincodeRegex, 'Valid 6-digit PIN code required'),
});

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().regex(indianPhoneRegex, 'Valid 10-digit Indian mobile number is required'),
  customerEmail: z.string().email('Valid email address required').optional().or(z.literal('')),
  shippingAddress: orderShippingAddressSchema,
  paymentMethod: z.enum(['COD', 'RAZORPAY']),
  couponCode: z.string().optional().nullable(),
  customerNotes: z.string().max(500).optional().nullable(),
  sessionId: z.string().optional().nullable(),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item').optional(),
});

export const quoteOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'Items required for quote').optional(),
  sessionId: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PLACED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingNumber: z.string().optional().nullable(),
  courierName: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
});

export const orderListQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(50, Math.max(1, parseInt(v, 10))) : 15)),
  status: z.enum(['PLACED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  search: z.string().optional(),
});
