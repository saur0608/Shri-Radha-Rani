import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('radha-rani-cookie-secret'),

  RAZORPAY_KEY_ID: z.string().default('rzp_test_sampleKey'),
  RAZORPAY_KEY_SECRET: z.string().default('sampleSecretKey'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('sampleWebhookSecret'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  STORE_NAME: z.string().default('Shri Radha Rani Shringar'),
  STORE_PHONE: z.string().default('+919876543210'),
  STORE_EMAIL: z.string().default('support@shriradharanishringar.com'),
  FREE_SHIPPING_THRESHOLD: z.string().default('999').transform((v) => parseFloat(v)),
  STANDARD_SHIPPING_FEE: z.string().default('70').transform((v) => parseFloat(v)),
  COD_AVAILABLE: z.string().default('true').transform((v) => v === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const ENV = parsed.data;
