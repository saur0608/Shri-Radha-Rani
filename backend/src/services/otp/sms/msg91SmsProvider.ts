import { ISmsProvider, SmsDeliveryResult } from './smsProvider.interface';
import { ENV } from '../../../config/env';
import { logger } from '../../../utils/logger';

export class Msg91SmsProvider implements ISmsProvider {
  name = 'MSG91';

  async sendOtp(phone: string, otp: string, purpose: string): Promise<SmsDeliveryResult> {
    const rawNumber = phone.replace(/^\+91/, '').replace(/^0/, '').replace(/\D/g, '');
    const formattedPhone = `91${rawNumber}`;
    const maskedPhone = `91${rawNumber.slice(0, 3)}****${rawNumber.slice(-2)}`;

    logger.info(`[MSG91] Step 1: Initiating SMS dispatch to ${maskedPhone} for ${purpose}`);

    if (!ENV.MSG91_AUTH_KEY || !ENV.MSG91_TEMPLATE_ID) {
      const errMsg = 'MSG91 credentials (MSG91_AUTH_KEY or MSG91_TEMPLATE_ID) not configured';
      logger.error(`[MSG91] Configuration Error: ${errMsg}`);
      return {
        success: false,
        provider: this.name,
        errorMessage: errMsg,
        normalizedPhone: formattedPhone,
      };
    }

    try {
      const url = `https://control.msg91.com/api/v5/otp?template_id=${ENV.MSG91_TEMPLATE_ID}&mobile=${formattedPhone}&otp=${otp}`;

      logger.info(`[MSG91] Step 2: Calling MSG91 OTP API with Template: ${ENV.MSG91_TEMPLATE_ID}`);
      const startTime = Date.now();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authkey: ENV.MSG91_AUTH_KEY,
          'Content-Type': 'application/json',
        },
      });

      const elapsedMs = Date.now() - startTime;
      const responseStatus = response.status;
      const data = (await response.json().catch(() => null)) as any;

      logger.info(`[MSG91] Step 3: Received response HTTP ${responseStatus} in ${elapsedMs}ms`, {
        type: data?.type,
        message: data?.message,
      });

      if (!response.ok || data?.type === 'error') {
        const errorDetail = data?.message || `HTTP ${responseStatus} ${response.statusText}`;
        logger.error(`[MSG91] Step 4: MSG91 rejected OTP: ${errorDetail}`);

        return {
          success: false,
          provider: this.name,
          statusCode: responseStatus,
          errorMessage: `MSG91 Error: ${errorDetail}`,
          rawResponse: data,
          normalizedPhone: formattedPhone,
        };
      }

      logger.info(`[MSG91] Step 4: OTP sent successfully via MSG91`);
      return {
        success: true,
        provider: this.name,
        messageId: data?.request_id,
        statusCode: responseStatus,
        rawResponse: data,
        normalizedPhone: formattedPhone,
      };
    } catch (err: any) {
      logger.error(`[MSG91] Network error:`, err);
      return {
        success: false,
        provider: this.name,
        errorMessage: `Network error connecting to MSG91: ${err.message}`,
        normalizedPhone: formattedPhone,
      };
    }
  }
}
