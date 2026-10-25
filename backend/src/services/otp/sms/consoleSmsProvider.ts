import { ISmsProvider } from './smsProvider.interface';
import { logger } from '../../../utils/logger';

export class ConsoleSmsProvider implements ISmsProvider {
  name = 'ConsoleSmsProvider';

  async sendOtp(phone: string, otp: string, purpose: string): Promise<boolean> {
    const dltMessage = `${otp} is your verification OTP for Shri Radha Rani Shringar (${purpose}). Valid for 5 minutes. Do not share this with anyone. Radhe Radhe!`;

    console.log('\n================== [DEV SMS OTP DISPATCH] ==================');
    console.log(`📱 TO: ${phone}`);
    console.log(`🎯 PURPOSE: ${purpose.toUpperCase()}`);
    console.log(`🔑 SECURE OTP: [ ${otp} ]`);
    console.log(`📜 DLT MESSAGE: "${dltMessage}"`);
    console.log('============================================================\n');

    logger.info(`[SMS Audit] Sent OTP for ${purpose} to ${phone.slice(0, 4)}****${phone.slice(-2)}`);
    return true;
  }
}
