import { IEmailProvider } from './emailProvider.interface';
import { ConsoleEmailProvider } from './consoleEmailProvider';
import { NodemailerProvider } from './nodemailerProvider';
import { ENV } from '../../../config/env';

let instance: IEmailProvider | null = null;

export function getEmailProvider(): IEmailProvider {
  if (instance) return instance;

  if (ENV.OTP_LOG_CONSOLE) {
    instance = new ConsoleEmailProvider();
    return instance;
  }

  switch (ENV.EMAIL_PROVIDER) {
    case 'nodemailer':
      instance = new NodemailerProvider();
      break;
    case 'console':
    default:
      instance = new ConsoleEmailProvider();
      break;
  }

  return instance;
}
