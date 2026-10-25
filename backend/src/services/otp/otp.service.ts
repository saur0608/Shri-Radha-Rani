import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { ApiError } from '../../utils/apiError';
import { ENV } from '../../config/env';
import { logger } from '../../utils/logger';
import { getSmsProvider } from './sms/smsProviderFactory';
import { getEmailProvider } from './email/emailProviderFactory';
import { signVerificationToken } from '../../utils/jwt';

export type OtpChannel = 'SMS' | 'EMAIL';
export type OtpPurpose = 'signup' | 'login' | 'checkout' | 'reset' | 'profile';

export class OtpService {
  /**
   * Normalize phone number to 10-digit Indian mobile (starts 6-9)
   */
  static normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^0/, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      throw ApiError.badRequest('Please enter a valid 10-digit Indian mobile number (starting with 6-9).');
    }
    return cleaned;
  }

  /**
   * Normalize email to lowercase and trim
   */
  static normalizeEmail(email: string): string {
    const cleaned = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      throw ApiError.badRequest('Please enter a valid email address.');
    }
    return cleaned;
  }

  /**
   * Normalize target based on channel
   */
  static normalizeTarget(target: string, channel: OtpChannel): string {
    if (channel === 'SMS') {
      return this.normalizePhone(target);
    }
    return this.normalizeEmail(target);
  }

  /**
   * Cryptographically secure HMAC-SHA256 OTP Hash
   */
  private static hashOtp(target: string, purpose: string, otp: string): string {
    return crypto
      .createHmac('sha256', ENV.OTP_SECRET)
      .update(`${target}:${purpose}:${otp}`)
      .digest('hex');
  }

  /**
   * Send a 6-digit OTP with 30s cooldown and 5/hour rate limits
   */
  static async sendOtp(params: {
    target: string;
    channel: OtpChannel;
    purpose: OtpPurpose;
    ipAddress?: string;
  }) {
    const { channel, purpose, ipAddress } = params;
    const normalizedTarget = this.normalizeTarget(params.target, channel);

    const now = new Date();

    // 1. Cooldown check: Has an OTP been sent to this target within the last 30s?
    const latestOtp = await prisma.otpRequest.findFirst({
      where: {
        target: normalizedTarget,
        purpose,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latestOtp) {
      const elapsedMs = now.getTime() - latestOtp.createdAt.getTime();
      const cooldownMs = ENV.OTP_COOLDOWN_SECONDS * 1000;
      if (elapsedMs < cooldownMs) {
        const secondsRemaining = Math.ceil((cooldownMs - elapsedMs) / 1000);
        throw ApiError.badRequest(
          `Please wait ${secondsRemaining}s before requesting another verification code.`,
          [{ cooldownRemaining: secondsRemaining }]
        );
      }
    }

    // 2. Hourly Rate Limit: Max 5 sends per hour per target
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const hourlyCount = await prisma.otpRequest.count({
      where: {
        target: normalizedTarget,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (hourlyCount >= ENV.OTP_HOURLY_LIMIT) {
      logger.warn(`[OTP Abuse Prevention] Target ${normalizedTarget} exceeded hourly limit (${hourlyCount})`);
      throw ApiError.badRequest('Maximum OTP attempts reached for this hour. Please try again later.');
    }

    // 3. Generate 6-Digit Cryptographically Secure Random OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = this.hashOtp(normalizedTarget, purpose, rawOtp);
    const expiresAt = new Date(now.getTime() + ENV.OTP_EXPIRY_MINUTES * 60 * 1000);

    // 4. Invalidate any existing unconsumed OTP for this target + purpose
    await prisma.otpRequest.updateMany({
      where: {
        target: normalizedTarget,
        purpose,
        consumedAt: null,
      },
      data: {
        consumedAt: now,
      },
    });

    // 5. Store hashed OTP in database
    await prisma.otpRequest.create({
      data: {
        target: normalizedTarget,
        channel,
        otpHash,
        purpose,
        expiresAt,
        ipAddress: ipAddress || null,
      },
    });

    // 6. Dispatch via SMS or Email provider
    let sent = false;
    if (channel === 'SMS') {
      const smsProvider = getSmsProvider();
      sent = await smsProvider.sendOtp(normalizedTarget, rawOtp, purpose);
    } else {
      const emailProvider = getEmailProvider();
      sent = await emailProvider.sendOtp(normalizedTarget, rawOtp, purpose);
    }

    if (!sent) {
      throw ApiError.internal('Unable to dispatch verification code at this moment. Please try again.');
    }

    return {
      success: true,
      message: `Verification code sent successfully via ${channel}.`,
      target: normalizedTarget,
      channel,
      cooldownSeconds: ENV.OTP_COOLDOWN_SECONDS,
      expiresInSeconds: ENV.OTP_EXPIRY_MINUTES * 60,
    };
  }

  /**
   * Verify a 6-digit OTP with maximum 5 attempts, single-use, and expiration checks
   */
  static async verifyOtp(params: {
    target: string;
    otp: string;
    purpose: OtpPurpose;
  }) {
    const { otp, purpose } = params;

    // Determine channel by target format
    const isEmail = params.target.includes('@');
    const channel: OtpChannel = isEmail ? 'EMAIL' : 'SMS';
    const normalizedTarget = this.normalizeTarget(params.target, channel);

    if (!/^\d{6}$/.test(otp)) {
      throw ApiError.badRequest('Verification code must be exactly 6 digits.');
    }

    const now = new Date();

    // 1. Find the active, unconsumed OTP request for target + purpose
    const otpRecord = await prisma.otpRequest.findFirst({
      where: {
        target: normalizedTarget,
        purpose,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw ApiError.badRequest('Invalid or expired verification code. Please request a new code.');
    }

    // 2. Check Expiry (5 minutes)
    if (otpRecord.expiresAt < now) {
      await prisma.otpRequest.update({
        where: { id: otpRecord.id },
        data: { consumedAt: now },
      });
      throw ApiError.badRequest('Verification code has expired. Please request a fresh code.');
    }

    // 3. Check Attempts (Max 5 attempts allowed)
    if (otpRecord.attempts >= ENV.OTP_MAX_ATTEMPTS) {
      await prisma.otpRequest.update({
        where: { id: otpRecord.id },
        data: { consumedAt: now },
      });
      throw ApiError.badRequest('Too many incorrect attempts. This code is invalidated. Please request a new one.');
    }

    // 4. Verify Hash in Constant Time
    const calculatedHash = this.hashOtp(normalizedTarget, purpose, otp);

    const isMatch =
      calculatedHash.length === otpRecord.otpHash.length &&
      crypto.timingSafeEqual(Buffer.from(calculatedHash, 'utf-8'), Buffer.from(otpRecord.otpHash, 'utf-8'));

    if (!isMatch) {
      const updatedAttempts = otpRecord.attempts + 1;
      const isNowInvalid = updatedAttempts >= ENV.OTP_MAX_ATTEMPTS;

      await prisma.otpRequest.update({
        where: { id: otpRecord.id },
        data: {
          attempts: updatedAttempts,
          ...(isNowInvalid ? { consumedAt: now } : {}),
        },
      });

      const remainingAttempts = Math.max(0, ENV.OTP_MAX_ATTEMPTS - updatedAttempts);
      if (remainingAttempts === 0) {
        throw ApiError.badRequest('Maximum attempts exceeded. This code is now invalid. Please request a new code.');
      }

      throw ApiError.badRequest(
        `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`
      );
    }

    // 5. Success: Consume the OTP immediately (single use)
    await prisma.otpRequest.update({
      where: { id: otpRecord.id },
      data: { consumedAt: now },
    });

    const verificationToken = signVerificationToken({
      target: normalizedTarget,
      channel,
      purpose,
    });

    logger.info(`[OTP Verified] Target ${normalizedTarget} successfully verified for ${purpose}`);

    return {
      success: true,
      verified: true,
      target: normalizedTarget,
      channel,
      purpose,
      verificationToken,
    };
  }

  /**
   * Periodic database cleanup for expired and consumed OTP records
   */
  static async cleanupExpiredOtps(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await prisma.otpRequest.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: oneDayAgo } },
          { consumedAt: { lt: oneDayAgo } },
        ],
      },
    });
    logger.info(`[OTP Cleanup] Removed ${result.count} stale OTP records`);
    return result.count;
  }
}
