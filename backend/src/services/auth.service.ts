import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import { ApiError } from '../utils/apiError';
import { signToken, verifyVerificationToken } from '../utils/jwt';
import { OtpService } from './otp/otp.service';
import {
  registerSchema,
  loginSchema,
  addressSchema,
  updateProfileSchema,
  otpLoginSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';
import { z } from 'zod';

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    const normalizedPhone = OtpService.normalizePhone(data.phone);
    const normalizedEmail = OtpService.normalizeEmail(data.email);

    // Check if phone already registered
    const existingPhone = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });
    if (existingPhone) {
      throw ApiError.conflict('An account with this mobile number already exists. Please log in.');
    }

    // Check if email already registered
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      throw ApiError.conflict('An account with this email address already exists. Please log in.');
    }

    // Requirement: Devotee must verify BOTH mobile number and email before account is activated
    if (!data.phoneVerificationToken) {
      throw ApiError.badRequest('Mobile number must be verified with OTP before signup.');
    }
    if (!data.emailVerificationToken) {
      throw ApiError.badRequest('Email address must be verified with OTP before signup.');
    }

    // Verify phone verification token
    try {
      const phonePayload = verifyVerificationToken(data.phoneVerificationToken);
      if (phonePayload.target !== normalizedPhone || phonePayload.purpose !== 'signup') {
        throw ApiError.badRequest('Invalid or mismatched mobile verification token.');
      }
    } catch {
      throw ApiError.badRequest('Expired or invalid mobile verification token. Please verify again.');
    }

    // Verify email verification token
    try {
      const emailPayload = verifyVerificationToken(data.emailVerificationToken);
      if (emailPayload.target !== normalizedEmail || emailPayload.purpose !== 'signup') {
        throw ApiError.badRequest('Invalid or mismatched email verification token.');
      }
    } catch {
      throw ApiError.badRequest('Expired or invalid email verification token. Please verify again.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
        passwordHash,
        phoneVerified: true,
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        phoneVerified: true,
        emailVerified: true,
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
    const target = isEmail
      ? OtpService.normalizeEmail(data.phoneOrEmail)
      : OtpService.normalizePhone(data.phoneOrEmail);

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: { equals: target, mode: 'insensitive' } }
        : { phone: target },
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
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async loginWithOtp(data: z.infer<typeof otpLoginSchema>) {
    // 1. Verify OTP first (fails if invalid, expired, or >5 attempts)
    const verifyResult = await OtpService.verifyOtp({
      target: data.target,
      otp: data.otp,
      purpose: 'login',
    });

    // 2. Find user by verified target
    const isEmail = verifyResult.channel === 'EMAIL';
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: { equals: verifyResult.target, mode: 'insensitive' } }
        : { phone: verifyResult.target },
    });

    if (!user) {
      throw ApiError.unauthorized(
        `No account found with this ${isEmail ? 'email address' : 'mobile number'}. Please sign up.`
      );
    }

    // 3. Mark channel verified if not already
    let updatedUser = user;
    if (isEmail && !user.emailVerified) {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    } else if (!isEmail && !user.phoneVerified) {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    const token = signToken({
      userId: updatedUser.id,
      role: updatedUser.role,
      phone: updatedUser.phone,
      email: updatedUser.email,
    });

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        phoneVerified: updatedUser.phoneVerified,
        emailVerified: updatedUser.emailVerified,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
      token,
    };
  }

  static async resetPassword(data: z.infer<typeof resetPasswordSchema>) {
    const isEmail = data.target.includes('@');
    const normalizedTarget = isEmail
      ? OtpService.normalizeEmail(data.target)
      : OtpService.normalizePhone(data.target);

    // Verify reset token
    let payload;
    try {
      payload = verifyVerificationToken(data.resetToken);
    } catch {
      throw ApiError.badRequest('Invalid or expired reset token. Please request a new OTP.');
    }

    if (payload.target !== normalizedTarget || payload.purpose !== 'reset') {
      throw ApiError.badRequest('Mismatched or invalid password reset token.');
    }

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: { equals: normalizedTarget, mode: 'insensitive' } }
        : { phone: normalizedTarget },
    });

    if (!user) {
      throw ApiError.badRequest('No account found for this mobile number or email.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        ...(isEmail ? { emailVerified: true } : { phoneVerified: true }),
      },
    });

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        phoneVerified: true,
        emailVerified: true,
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
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      throw ApiError.notFound('User profile not found.');
    }

    let phoneToUpdate = currentUser.phone;
    let phoneVerified = currentUser.phoneVerified;
    let emailToUpdate = currentUser.email;
    let emailVerified = currentUser.emailVerified;

    // Mobile number change requires OTP verification
    if (data.phone && data.phone !== currentUser.phone) {
      const normalizedPhone = OtpService.normalizePhone(data.phone);

      const existingPhone = await prisma.user.findFirst({
        where: { phone: normalizedPhone, NOT: { id: userId } },
      });
      if (existingPhone) {
        throw ApiError.conflict('This mobile number is already in use by another account.');
      }

      if (!data.phoneVerificationToken) {
        throw ApiError.badRequest('OTP verification is required to update your mobile number.');
      }

      try {
        const payload = verifyVerificationToken(data.phoneVerificationToken);
        if (payload.target !== normalizedPhone || payload.purpose !== 'profile') {
          throw ApiError.badRequest('Invalid or mismatched verification token for new mobile number.');
        }
        phoneToUpdate = normalizedPhone;
        phoneVerified = true;
      } catch {
        throw ApiError.badRequest('Invalid or expired mobile verification token.');
      }
    }

    // Email change requires OTP verification
    if (data.email && data.email !== currentUser.email) {
      const normalizedEmail = OtpService.normalizeEmail(data.email);

      const existingEmail = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' }, NOT: { id: userId } },
      });
      if (existingEmail) {
        throw ApiError.conflict('This email address is already in use by another account.');
      }

      if (!data.emailVerificationToken) {
        throw ApiError.badRequest('OTP verification is required to update your email address.');
      }

      try {
        const payload = verifyVerificationToken(data.emailVerificationToken);
        if (payload.target !== normalizedEmail || payload.purpose !== 'profile') {
          throw ApiError.badRequest('Invalid or mismatched verification token for new email address.');
        }
        emailToUpdate = normalizedEmail;
        emailVerified = true;
      } catch {
        throw ApiError.badRequest('Invalid or expired email verification token.');
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        phone: phoneToUpdate,
        phoneVerified,
        email: emailToUpdate,
        emailVerified,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        phoneVerified: true,
        emailVerified: true,
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
