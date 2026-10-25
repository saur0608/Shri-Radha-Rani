import { ISmsProvider, SmsDeliveryResult } from './smsProvider.interface';
import { logger } from '../../../utils/logger';

export class ConsoleSmsProvider implements ISmsProvider {
  name = 'Console';

  async sendOtp(phone: string, otp: string, purpose: string): Promise<SmsDeliveryResult> {
    const dltMessage = `${otp} is your verification OTP for Shri Radha Rani Shringar (${purpose}). Valid for 5 minutes. Do not share this with anyone. Radhe Radhe!`;

    console.log('\n================== [DEV SMS OTP DISPATCH] ==================');
    console.log(`📱 TO: ${phone}`);
    console.log(`🎯 PURPOSE: ${purpose.toUpperCase()}`);
    console.log(`🔑 SECURE OTP: [ ${otp} ]`);
    console.log(`📜 DLT MESSAGE: "${dltMessage}"`);
    console.log(`⚠️  NOTE: Server is running in LOCAL CONSOLE mode (SMS_PROVIDER=console or OTP_LOG_CONSOLE=true). No real SMS is dispatched to telecoms.`);
    console.log('============================================================\n');

    logger.info(`[SMS Audit] Console mock OTP for ${purpose} to ${phone.slice(0, 4)}****${phone.slice(-2)}`);
    return {
      success: true,
      provider: this.name,
      messageId: `console_mock_${Date.now()}`,
      normalizedPhone: phone,
    };
  }
}
