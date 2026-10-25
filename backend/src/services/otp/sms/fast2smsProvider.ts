import { ISmsProvider } from './smsProvider.interface';
import { ENV } from '../../../config/env';
import { logger } from '../../../utils/logger';

export class Fast2SmsProvider implements ISmsProvider {
  name = 'Fast2SMS';

  async sendOtp(phone: string, otp: string, purpose: string): Promise<boolean> {
    if (!ENV.FAST2SMS_API_KEY) {
      logger.error('Fast2SMS API key not configured');
      return false;
    }

    // Standardize 10-digit number for Fast2SMS API
    const rawNumber = phone.replace(/^\+91/, '').replace(/\D/g, '');

    try {
      // DLT Template route if template ID configured, else Quick OTP route
      let url = 'https://www.fast2sms.com/dev/bulkV2';
      let payload: Record<string, string>;

      if (ENV.FAST2SMS_DLT_TEMPLATE_ID) {
        payload = {
          route: 'dlt',
          sender_id: ENV.FAST2SMS_SENDER_ID,
          message: ENV.FAST2SMS_DLT_TEMPLATE_ID,
          variables_values: otp,
          flash: '0',
          numbers: rawNumber,
        };
      } else {
        payload = {
          route: 'otp',
          variables_values: otp,
          numbers: rawNumber,
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: ENV.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { return?: boolean; message?: string[] };
      if (!data.return) {
        logger.error('Fast2SMS error response:', data);
        return false;
      }

      logger.info(`[Fast2SMS] Dispatched OTP to ${rawNumber.slice(0, 3)}****${rawNumber.slice(-2)} for ${purpose}`);
      return true;
    } catch (err) {
      logger.error('Fast2SMS network error:', err);
      return false;
    }
  }
}
