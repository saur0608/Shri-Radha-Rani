import { IEmailProvider, EmailDeliveryResult } from './emailProvider.interface';
import { logger } from '../../../utils/logger';

export class ConsoleEmailProvider implements IEmailProvider {
  name = 'Console';

  async sendOtp(email: string, otp: string, purpose: string): Promise<EmailDeliveryResult> {
    console.log('\n================== [DEV EMAIL OTP DISPATCH] ==================');
    console.log(`📧 TO: ${email}`);
    console.log(`🎯 PURPOSE: ${purpose.toUpperCase()}`);
    console.log(`🔑 SECURE OTP: [ ${otp} ]`);
    console.log(`⏳ VALIDITY: 5 minutes`);
    console.log(`⚠️  NOTE: Server is running in LOCAL DEV mode (EMAIL_PROVIDER=console or OTP_DEV_MODE=true).`);
    console.log(`👉 Real email is NOT dispatched via SMTP. To send real email, set EMAIL_PROVIDER=nodemailer and OTP_DEV_MODE=false.`);
    console.log('==============================================================\n');

    logger.info(`[Email Audit] Console mock OTP for ${purpose} to ${email.slice(0, 3)}***@${email.split('@')[1]}`);
    return {
      success: true,
      provider: this.name,
      messageId: `console_mock_email_${Date.now()}`,
    };
  }
}
