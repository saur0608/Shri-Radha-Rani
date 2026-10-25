import { z } from 'zod';

export const productQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(50, Math.max(1, parseInt(v, 10))) : 12)),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  maxPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  size: z.string().optional(),
  color: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'bestseller']).optional().default('newest'),
  isFeatured: z.string().optional().transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  isBestseller: z.string().optional().transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  isNewArrival: z.string().optional().transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  nameHi: z.string().min(2, 'Hindi name is required'),
  slug: z.string().min(2).optional(),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description is required'),
  descriptionHi: z.string().optional(),
  basePrice: z.number().positive('Base price must be greater than zero'),
  discountPrice: z.number().positive().optional().nullable(),
  sku: z.string().min(2, 'SKU is required'),
  stock: z.number().int().nonnegative().default(0),
  isFeatured: z.boolean().optional().default(false),
  isBestseller: z.boolean().optional().default(false),
  isNewArrival: z.boolean().optional().default(false),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  careInstructions: z.string().optional(),
  careInstructionsHi: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url('Invalid image URL'),
        altText: z.string().optional(),
        isPrimary: z.boolean().optional().default(false),
        displayOrder: z.number().int().optional().default(0),
      })
    )
    .min(1, 'At least one product image is required'),
  variants: z
    .array(
      z.object({
        size: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        sku: z.string().min(2),
        price: z.number().positive(),
        stock: z.number().int().nonnegative().default(0),
      })
    )
    .optional()
    .default([]),
});

export const updateProductSchema = createProductSchema.partial();
