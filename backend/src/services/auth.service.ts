import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import { ApiError } from '../utils/apiError';
import { signToken } from '../utils/jwt';
import { registerSchema, loginSchema, addressSchema, updateProfileSchema } from '../validators/auth.validator';
import { z } from 'zod';

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    // Check if phone already registered
    const existingPhone = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (existingPhone) {
      throw ApiError.conflict('An account with this mobile number already exists. Please log in.');
    }

    if (data.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw ApiError.conflict('An account with this email address already exists.');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = signToken({
      userId: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
    });

    return { user, token };
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const isEmail = data.phoneOrEmail.includes('@');
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: { equals: data.phoneOrEmail, mode: 'insensitive' } }
        : { phone: data.phoneOrEmail },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid mobile number/email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid mobile number/email or password.');
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User profile not found.');
    }

    return user;
  }

  static async updateProfile(userId: string, data: z.infer<typeof updateProfileSchema>) {
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: userId } },
      });
      if (existing) {
        throw ApiError.conflict('This email is already in use by another account.');
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  static async addAddress(userId: string, data: z.infer<typeof addressSchema>) {
    if (data.isDefault) {
      // Unset previous default addresses
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    } else {
      // If user has no addresses yet, make this one default
      const count = await prisma.address.count({ where: { userId } });
      if (count === 0) {
        data.isDefault = true;
      }
    }

    return prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  static async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw ApiError.notFound('Address not found.');
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return { message: 'Address removed successfully.' };
  }
}
