import { Request, Response, NextFunction } from 'express';
import { OtpService, OtpChannel } from '../services/otp/otp.service';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { setAuthCookie, signToken } from '../utils/jwt';

export class OtpController {
  /**
   * POST /api/otp/send
   * Allows ANY Indian mobile number (10-digit, 6-9) or ANY email to receive a 6-digit OTP
   */
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const rawTarget = req.body.target || req.body.phone || req.body.email;
      if (!rawTarget) {
        throw ApiError.badRequest('Please provide a mobile number or email address.');
      }

      const isEmail = rawTarget.includes('@');
      const channel: OtpChannel = req.body.channel || (isEmail ? 'EMAIL' : 'SMS');
      const purpose = req.body.purpose || 'verification';
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip;

      const maskedTarget = isEmail
        ? `${rawTarget.slice(0, 3)}***@${rawTarget.split('@')[1]}`
        : `${rawTarget.replace(/\D/g, '').slice(0, 3)}****${rawTarget.replace(/\D/g, '').slice(-2)}`;

      logger.info(`[OtpController.sendOtp] Request received: target="${maskedTarget}", channel="${channel}", purpose="${purpose}", ip="${ipAddress}"`);

      const result = await OtpService.sendOtp({
        target: rawTarget,
        channel,
        purpose,
        ipAddress,
      });

      // Never return the OTP or hash in response
      return ApiResponse.success(
        res,
        {
          target: result.target,
          channel: result.channel,
          cooldownSeconds: result.cooldownSeconds,
          expiresInSeconds: result.expiresInSeconds,
        },
        result.message
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/otp/verify
   * Verifies the 6-digit OTP, marks phone/email verified in DB, and returns a signed token
   */
  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const rawTarget = req.body.target || req.body.phone || req.body.email;
      const { otp } = req.body;
      const purpose = req.body.purpose || 'verification';

      if (!rawTarget) {
        throw ApiError.badRequest('Please provide a mobile number or email address.');
      }
      if (!otp) {
        throw ApiError.badRequest('Verification code is required.');
      }

      const result = await OtpService.verifyOtp({
        target: rawTarget,
        otp,
        purpose,
      });

      const isEmail = result.channel === 'EMAIL';

      // Check if user exists in database and mark verified
      const user = await prisma.user.findFirst({
        where: isEmail
          ? { email: { equals: result.target, mode: 'insensitive' } }
          : { phone: result.target },
      });

      if (user) {
        if (isEmail && !user.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true },
          });
          logger.info(`[OtpController.verifyOtp] Marked emailVerified=true for user ID "${user.id}"`);
        } else if (!isEmail && !user.phoneVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { phoneVerified: true },
          });
          logger.info(`[OtpController.verifyOtp] Marked phoneVerified=true for user ID "${user.id}"`);
        }
      }

      // If purpose is 'login' and user exists, issue auth session cookie
      let sessionToken: string | undefined;
      let userData: any = undefined;

      if (purpose === 'login' && user) {
        sessionToken = signToken({
          userId: user.id,
          role: user.role,
          phone: user.phone,
          email: user.email,
        });
        setAuthCookie(res, sessionToken);
        userData = {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          phoneVerified: user.phoneVerified,
          emailVerified: user.emailVerified,
          role: user.role,
        };
      }

      return ApiResponse.success(
        res,
        {
          verified: true,
          target: result.target,
          channel: result.channel,
          purpose: result.purpose,
          verificationToken: result.verificationToken,
          ...(sessionToken ? { token: sessionToken, user: userData } : {}),
        },
        'Verification successful.'
      );
    } catch (err) {
      next(err);
    }
  }
}
