import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp/otp.service';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { setAuthCookie, clearAuthCookie, signToken } from '../utils/jwt';

export class AuthController {
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { target, purpose } = req.body;
      const isEmail = target.includes('@');
      const channel = req.body.channel || (isEmail ? 'EMAIL' : 'SMS');
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip;

      // Generic protection for login / reset: if user does not exist, return generic message without sending
      if (purpose === 'login' || purpose === 'reset') {
        const normalized = isEmail ? OtpService.normalizeEmail(target) : OtpService.normalizePhone(target);
        const userExists = await prisma.user.findFirst({
          where: isEmail
            ? { email: { equals: normalized, mode: 'insensitive' } }
            : { phone: normalized },
        });

        if (!userExists) {
          return ApiResponse.success(
            res,
            {
              target: normalized,
              channel,
              cooldownSeconds: 30,
              expiresInSeconds: 300,
            },
            'If this account exists, a 6-digit verification code has been sent.'
          );
        }
      }

      const result = await OtpService.sendOtp({
        target,
        channel,
        purpose,
        ipAddress,
      });

      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { target, otp, purpose } = req.body;
      const result = await OtpService.verifyOtp({ target, otp, purpose });

      // If purpose is 'login', set session cookie and return user info
      if (purpose === 'login') {
        const isEmail = result.channel === 'EMAIL';
        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: { equals: result.target, mode: 'insensitive' } }
            : { phone: result.target },
        });

        if (!user) {
          throw ApiError.badRequest('No registered account found with these details.');
        }

        // Mark channel verified
        if (isEmail && !user.emailVerified) {
          await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
        } else if (!isEmail && !user.phoneVerified) {
          await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
        }

        const token = signToken({
          userId: user.id,
          role: user.role,
          phone: user.phone,
          email: user.email,
        });

        setAuthCookie(res, token);

        return ApiResponse.success(
          res,
          {
            verified: true,
            verificationToken: result.verificationToken,
            token,
            user: {
              id: user.id,
              name: user.name,
              phone: user.phone,
              email: user.email,
              phoneVerified: user.phoneVerified,
              emailVerified: user.emailVerified,
              role: user.role,
            },
          },
          'Verification successful. Welcome back!'
        );
      }

      // For other purposes (signup, checkout, reset, profile), return verification token
      return ApiResponse.success(
        res,
        {
          verified: true,
          verificationToken: result.verificationToken,
          target: result.target,
          channel: result.channel,
          purpose: result.purpose,
        },
        'Verification successful.'
      );
    } catch (err) {
      next(err);
    }
  }

  static async loginWithOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.loginWithOtp(req.body);
      setAuthCookie(res, result.token);
      return ApiResponse.success(res, result, 'Welcome back! Logged in successfully via OTP.');
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.resetPassword(req.body);
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      setAuthCookie(res, result.token);
      return ApiResponse.created(res, result, 'Devotee account registered successfully. Radhe Radhe!');
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      setAuthCookie(res, result.token);
      return ApiResponse.success(res, result, 'Welcome back! Logged in successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      clearAuthCookie(res);
      return ApiResponse.success(res, null, 'Logged out successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await AuthService.getProfile(req.user!.userId);
      return ApiResponse.success(res, profile, 'Profile retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await AuthService.updateProfile(req.user!.userId, req.body);
      return ApiResponse.success(res, updated, 'Profile updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const address = await AuthService.addAddress(req.user!.userId, req.body);
      return ApiResponse.created(res, address, 'Delivery address saved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.deleteAddress(req.user!.userId, req.params.id);
      return ApiResponse.success(res, result, 'Address removed successfully.');
    } catch (err) {
      next(err);
    }
  }
}
