import { ISmsProvider } from './smsProvider.interface';
import { ENV } from '../../../config/env';
import { logger } from '../../../utils/logger';

export class TwilioSmsProvider implements ISmsProvider {
  name = 'Twilio';

  async sendOtp(phone: string, otp: string, purpose: string): Promise<boolean> {
    if (!ENV.TWILIO_ACCOUNT_SID || !ENV.TWILIO_AUTH_TOKEN || !ENV.TWILIO_PHONE_NUMBER) {
      logger.error('Twilio credentials not configured');
      return false;
    }

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const dltMessage = `${otp} is your verification code for Shri Radha Rani Shringar (${purpose}). Valid for 5 minutes. Radhe Radhe!`;

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${ENV.TWILIO_ACCOUNT_SID}/Messages.json`;
      const authHeader = Buffer.from(`${ENV.TWILIO_ACCOUNT_SID}:${ENV.TWILIO_AUTH_TOKEN}`).toString('base64');

      const formData = new URLSearchParams();
      formData.append('To', formattedPhone);
      formData.append('From', ENV.TWILIO_PHONE_NUMBER);
      formData.append('Body', dltMessage);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('Twilio API error:', errorData);
        return false;
      }

      logger.info(`[Twilio] Sent SMS to ${formattedPhone.slice(0, 5)}****${formattedPhone.slice(-2)} for ${purpose}`);
      return true;
    } catch (err) {
      logger.error('Twilio network error:', err);
      return false;
    }
  }
}
