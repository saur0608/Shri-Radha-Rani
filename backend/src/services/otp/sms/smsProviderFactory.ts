import { ISmsProvider } from './smsProvider.interface';
import { ConsoleSmsProvider } from './consoleSmsProvider';
import { Fast2SmsProvider } from './fast2smsProvider';
import { TwilioSmsProvider } from './twilioSmsProvider';
import { ENV } from '../../../config/env';

let instance: ISmsProvider | null = null;

export function getSmsProvider(): ISmsProvider {
  if (instance) return instance;

  if (ENV.OTP_LOG_CONSOLE) {
    instance = new ConsoleSmsProvider();
    return instance;
  }

  switch (ENV.SMS_PROVIDER) {
    case 'fast2sms':
      instance = new Fast2SmsProvider();
      break;
    case 'twilio':
      instance = new TwilioSmsProvider();
      break;
    case 'console':
    default:
      instance = new ConsoleSmsProvider();
      break;
  }

  return instance;
}
