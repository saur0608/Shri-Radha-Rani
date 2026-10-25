import { ISmsProvider, SmsDeliveryResult } from './smsProvider.interface';
import { ENV } from '../../../config/env';
import { logger } from '../../../utils/logger';

export class TwilioSmsProvider implements ISmsProvider {
  name = 'Twilio';

  async sendOtp(phone: string, otp: string, purpose: string): Promise<SmsDeliveryResult> {
    const cleaned = phone.replace(/^\+91/, '').replace(/^0/, '').replace(/\D/g, '');
    const formattedPhone = `+91${cleaned}`;
    const maskedPhone = `+91${cleaned.slice(0, 3)}****${cleaned.slice(-2)}`;

    logger.info(`[Twilio] Step 1: Initiating SMS dispatch to ${maskedPhone} for ${purpose}`);

    if (!ENV.TWILIO_ACCOUNT_SID || !ENV.TWILIO_AUTH_TOKEN || !ENV.TWILIO_PHONE_NUMBER) {
      const errMsg = 'Twilio credentials (ACCOUNT_SID, AUTH_TOKEN, or PHONE_NUMBER) not configured';
      logger.error(`[Twilio] Configuration Error: ${errMsg}`);
      return {
        success: false,
        provider: this.name,
        errorMessage: errMsg,
        normalizedPhone: formattedPhone,
      };
    }

    const dltMessage = `${otp} is your verification code for Shri Radha Rani Shringar (${purpose}). Valid for 5 minutes. Radhe Radhe!`;

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${ENV.TWILIO_ACCOUNT_SID}/Messages.json`;
      const authHeader = Buffer.from(`${ENV.TWILIO_ACCOUNT_SID}:${ENV.TWILIO_AUTH_TOKEN}`).toString('base64');

      const formData = new URLSearchParams();
      formData.append('To', formattedPhone);
      formData.append('From', ENV.TWILIO_PHONE_NUMBER);
      formData.append('Body', dltMessage);

      logger.info(`[Twilio] Step 2: Calling Twilio Messages API at ${url} from ${ENV.TWILIO_PHONE_NUMBER}`);
      const startTime = Date.now();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const elapsedMs = Date.now() - startTime;
      const responseStatus = response.status;
      const data = (await response.json().catch(() => null)) as any;

      logger.info(`[Twilio] Step 3: Received response HTTP ${responseStatus} in ${elapsedMs}ms`, {
        status: data?.status,
        sid: data?.sid,
        errorCode: data?.error_code,
      });

      if (!response.ok) {
        let errorDetail = data?.message || `HTTP ${responseStatus} ${response.statusText}`;
        if (data?.code === 21608) {
          errorDetail = `Twilio Trial Account Limitation: The number ${formattedPhone} is unverified. In Twilio trial mode, you can only send to verified caller IDs.`;
        } else if (data?.code === 21211) {
          errorDetail = `Invalid 'To' Phone Number format: ${formattedPhone}`;
        } else if (data?.code === 20003) {
          errorDetail = 'Twilio Authentication Error: Invalid Account SID or Auth Token';
        }

        logger.error(`[Twilio] Step 4: Twilio rejected SMS: ${errorDetail}`, {
          code: data?.code,
          moreInfo: data?.more_info,
        });

        return {
          success: false,
          provider: this.name,
          statusCode: responseStatus,
          errorMessage: errorDetail,
          rawResponse: data,
          normalizedPhone: formattedPhone,
        };
      }

      logger.info(`[Twilio] Step 4: SMS queued successfully. Twilio SID: ${data?.sid}, Status: ${data?.status}`);
      return {
        success: true,
        provider: this.name,
        messageId: data?.sid,
        statusCode: responseStatus,
        rawResponse: data,
        normalizedPhone: formattedPhone,
      };
    } catch (err: any) {
      logger.error(`[Twilio] Network or execution error:`, err);
      return {
        success: false,
        provider: this.name,
        errorMessage: `Network error connecting to Twilio: ${err.message}`,
        normalizedPhone: formattedPhone,
      };
    }
  }
}
