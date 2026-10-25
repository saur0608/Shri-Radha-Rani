import { IEmailProvider } from './emailProvider.interface';
import { ConsoleEmailProvider } from './consoleEmailProvider';
import { NodemailerProvider } from './nodemailerProvider';
import { ENV } from '../../../config/env';
import { logger } from '../../../utils/logger';

export function getEmailProvider(overrideProvider?: string): IEmailProvider {
  const selectedProvider = overrideProvider || (ENV.OTP_LOG_CONSOLE && ENV.EMAIL_PROVIDER === 'console' ? 'console' : ENV.EMAIL_PROVIDER);

  logger.info(`[Email Factory] Resolving provider: requested="${overrideProvider || 'none'}", configured="${ENV.EMAIL_PROVIDER}", OTP_LOG_CONSOLE=${ENV.OTP_LOG_CONSOLE} -> Active="${selectedProvider}"`);

  switch (selectedProvider) {
    case 'nodemailer':
      return new NodemailerProvider();
    case 'console':
    default:
      if (ENV.NODE_ENV === 'production') {
        logger.warn('[Email Factory] ⚠️ EMAIL_PROVIDER is set to "console" in production! Real email will not be sent.');
      }
      return new ConsoleEmailProvider();
  }
}
