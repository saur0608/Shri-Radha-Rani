import { IEmailProvider } from './emailProvider.interface';
import { logger } from '../../../utils/logger';

export class ConsoleEmailProvider implements IEmailProvider {
  name = 'ConsoleEmailProvider';

  async sendOtp(email: string, otp: string, purpose: string): Promise<boolean> {
    console.log('\n================== [DEV EMAIL OTP DISPATCH] ==================');
    console.log(`📧 TO: ${email}`);
    console.log(`🎯 PURPOSE: ${purpose.toUpperCase()}`);
    console.log(`🔑 SECURE OTP: [ ${otp} ]`);
    console.log(`⏳ VALIDITY: 5 minutes`);
    console.log('==============================================================\n');

    logger.info(`[Email Audit] Sent OTP for ${purpose} to ${email.slice(0, 3)}***@${email.split('@')[1]}`);
    return true;
  }
}
