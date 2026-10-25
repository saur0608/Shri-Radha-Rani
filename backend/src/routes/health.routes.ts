import { Router, Request, Response } from 'express';
import { ENV } from '../config/env';
import { getSmsProvider } from '../services/otp/sms/smsProviderFactory';
import { getEmailProvider } from '../services/otp/email/emailProviderFactory';
import { OtpService } from '../services/otp/otp.service';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Middleware: allow access if logged in as ADMIN OR if secret x-admin-key header matches
const adminOrSecretKey = (req: Request, res: Response, next: Function) => {
  const secretKey = req.headers['x-admin-key'];
  if (secretKey && (secretKey === ENV.JWT_SECRET || secretKey === ENV.COOKIE_SECRET)) {
    return next();
  }
  // Otherwise fall back to standard JWT admin middleware
  return authenticate(req, res, () => {
    return requireRole('ADMIN')(req, res, next as any);
  });
};


/**
 * GET/POST /api/health/otp-check
 * Live diagnostic check for SMS and Email OTP providers.
 */
router.all('/otp-check', adminOrSecretKey, async (req: Request, res: Response) => {
  const phone = (req.query.phone as string) || req.body?.phone;
  const email = (req.query.email as string) || req.body?.email;
  const requestedProvider = (req.query.provider as string) || req.body?.provider;

  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: ENV.NODE_ENV,
      OTP_LOG_CONSOLE: ENV.OTP_LOG_CONSOLE,
      activeSmsProvider: ENV.SMS_PROVIDER,
      activeEmailProvider: ENV.EMAIL_PROVIDER,
    },
    credentialsStatus: {
      fast2smsApiKey: ENV.FAST2SMS_API_KEY
        ? ENV.FAST2SMS_API_KEY === 'sample_fast2sms_key'
          ? '⚠️ Placeholder (sample_fast2sms_key)'
          : '✅ Configured'
        : '❌ Not Set',
      fast2smsSenderId: ENV.FAST2SMS_SENDER_ID,
      fast2smsDltTemplateId: ENV.FAST2SMS_DLT_TEMPLATE_ID
        ? ENV.FAST2SMS_DLT_TEMPLATE_ID === '1107161234567890123'
          ? '⚠️ Placeholder Template ID'
          : '✅ Configured'
        : 'ℹ️ Not set (uses Fast2SMS Quick OTP route)',
      twilioAccountSid: ENV.TWILIO_ACCOUNT_SID ? '✅ Configured' : '❌ Not Set',
      twilioAuthToken: ENV.TWILIO_AUTH_TOKEN ? '✅ Configured' : '❌ Not Set',
      twilioPhoneNumber: ENV.TWILIO_PHONE_NUMBER || '❌ Not Set',
      msg91AuthKey: ENV.MSG91_AUTH_KEY ? '✅ Configured' : '❌ Not Set',
      msg91TemplateId: ENV.MSG91_TEMPLATE_ID || '❌ Not Set',
      smtpUser: ENV.SMTP_USER || '❌ Not Set',
      smtpPass: ENV.SMTP_PASS
        ? ENV.SMTP_PASS === 'sample_password'
          ? '⚠️ Placeholder (sample_password)'
          : '✅ Configured'
        : '❌ Not Set',
      smtpHost: `${ENV.SMTP_HOST}:${ENV.SMTP_PORT}`,
    },
  };

  let smsResult = null;
  let emailResult = null;

  // 1. Test SMS if phone provided
  if (phone) {
    try {
      const normalizedPhone = OtpService.normalizePhone(phone);
      const smsProvider = getSmsProvider(requestedProvider);
      diagnostics.smsTest = {
        target: normalizedPhone,
        provider: smsProvider.name,
      };

      const result = await smsProvider.sendOtp(normalizedPhone, testOtp, 'health-check');
      smsResult = result;
      diagnostics.smsTest.result = result;
    } catch (err: any) {
      smsResult = { success: false, error: err.message };
      diagnostics.smsTest = { error: err.message };
    }
  }

  // 2. Test Email if email provided
  if (email) {
    try {
      const normalizedEmail = OtpService.normalizeEmail(email);
      const emailProvider = getEmailProvider();
      diagnostics.emailTest = {
        target: normalizedEmail,
        provider: emailProvider.name,
      };

      const result = await emailProvider.sendOtp(normalizedEmail, testOtp, 'health-check');
      emailResult = result;
      diagnostics.emailTest.result = result;
    } catch (err: any) {
      emailResult = { success: false, error: err.message };
      diagnostics.emailTest = { error: err.message };
    }
  }

  const isHealthy = (!phone || smsResult?.success) && (!email || emailResult?.success);

  return res.status(isHealthy ? 200 : 502).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    message: isHealthy
      ? 'OTP health check completed successfully.'
      : 'OTP provider failed to dispatch test message. Review diagnostics below.',
    diagnostics,
  });
});

export default router;
