import { ISmsProvider } from './smsProvider.interface';
import { ConsoleSmsProvider } from './consoleSmsProvider';
import { Fast2SmsProvider } from './fast2smsProvider';
import { TwilioSmsProvider } from './twilioSmsProvider';
import { Msg91SmsProvider } from './msg91SmsProvider';
import { ENV } from '../../../config/env';
import { logger } from '../../../utils/logger';

let mockProviderInstance: ISmsProvider | null = null;

export function setSmsProviderForTesting(provider: ISmsProvider | null) {
  mockProviderInstance = provider;
}

export function getSmsProvider(overrideProvider?: string): ISmsProvider {
  if (mockProviderInstance) {
    return mockProviderInstance;
  }

  const selectedProvider = overrideProvider || (ENV.OTP_LOG_CONSOLE && ENV.SMS_PROVIDER === 'console' ? 'console' : ENV.SMS_PROVIDER);

  logger.info(`[SMS Factory] Resolving provider: requested="${overrideProvider || 'none'}", configured="${ENV.SMS_PROVIDER}", OTP_LOG_CONSOLE=${ENV.OTP_LOG_CONSOLE} -> Active="${selectedProvider}"`);

  switch (selectedProvider) {
    case 'fast2sms':
      return new Fast2SmsProvider();
    case 'twilio':
      return new TwilioSmsProvider();
    case 'msg91':
      return new Msg91SmsProvider();
    case 'console':
    default:
      if (ENV.NODE_ENV === 'production') {
        logger.warn('[SMS Factory] ⚠️ SMS_PROVIDER is set to "console" in production! Real SMS will not be sent.');
      }
      return new ConsoleSmsProvider();
  }
}
