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
    console.log(`⚠️  NOTE: Server is running in LOCAL CONSOLE mode (EMAIL_PROVIDER=console or OTP_LOG_CONSOLE=true). No real email is dispatched via SMTP.`);
    console.log('==============================================================\n');

    logger.info(`[Email Audit] Console mock OTP for ${purpose} to ${email.slice(0, 3)}***@${email.split('@')[1]}`);
    return {
      success: true,
      provider: this.name,
      messageId: `console_mock_email_${Date.now()}`,
    };
  }
}
