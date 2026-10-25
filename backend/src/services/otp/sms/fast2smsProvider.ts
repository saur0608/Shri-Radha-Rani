import { ISmsProvider, SmsDeliveryResult } from './smsProvider.interface';
import { ENV } from '../../../config/env';
import { logger } from '../../../utils/logger';

export class Fast2SmsProvider implements ISmsProvider {
  name = 'Fast2SMS';

  async sendOtp(phone: string, otp: string, purpose: string): Promise<SmsDeliveryResult> {
    const rawNumber = phone.replace(/^\+91/, '').replace(/^0/, '').replace(/\D/g, '');
    const maskedPhone = `${rawNumber.slice(0, 3)}****${rawNumber.slice(-2)}`;

    logger.info(`[Fast2SMS] Step 1: Initiating SMS dispatch to ${maskedPhone} for ${purpose}`);

    if (!ENV.FAST2SMS_API_KEY || ENV.FAST2SMS_API_KEY === 'sample_fast2sms_key') {
      const errMsg = 'Fast2SMS API key is not configured or still set to sample placeholder';
      logger.error(`[Fast2SMS] Configuration Error: ${errMsg}`);
      return {
        success: false,
        provider: this.name,
        errorMessage: errMsg,
        normalizedPhone: rawNumber,
      };
    }

    try {
      const url = 'https://www.fast2sms.com/dev/bulkV2';
      let payload: Record<string, any>;

      if (ENV.FAST2SMS_DLT_TEMPLATE_ID && ENV.FAST2SMS_DLT_TEMPLATE_ID !== '1107161234567890123') {
        logger.info(`[Fast2SMS] Step 2: Using DLT Route with Sender: ${ENV.FAST2SMS_SENDER_ID}, Template: ${ENV.FAST2SMS_DLT_TEMPLATE_ID}`);
        payload = {
          route: 'dlt',
          sender_id: ENV.FAST2SMS_SENDER_ID,
          message: ENV.FAST2SMS_DLT_TEMPLATE_ID,
          variables_values: otp,
          flash: '0',
          numbers: rawNumber,
          ...(ENV.FAST2SMS_ENTITY_ID ? { entity_id: ENV.FAST2SMS_ENTITY_ID } : {}),
        };
      } else {
        logger.info(`[Fast2SMS] Step 2: Using Quick OTP Route (no custom DLT template specified)`);
        payload = {
          route: 'otp',
          variables_values: otp,
          numbers: rawNumber,
        };
      }

      logger.info(`[Fast2SMS] Step 3: Calling Fast2SMS API at ${url}`);
      const startTime = Date.now();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: ENV.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const elapsedMs = Date.now() - startTime;
      const responseStatus = response.status;
      const data = (await response.json().catch(() => null)) as any;

      logger.info(`[Fast2SMS] Step 4: Received response HTTP ${responseStatus} in ${elapsedMs}ms`, {
        return: data?.return,
        request_id: data?.request_id,
        message: data?.message,
      });

      if (!response.ok || !data?.return) {
        const errorDetail = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message || `HTTP ${responseStatus} ${response.statusText}`;

        logger.error(`[Fast2SMS] Step 5: Gateway rejected SMS: ${errorDetail}`, {
          httpStatus: responseStatus,
          raw: data,
        });

        return {
          success: false,
          provider: this.name,
          statusCode: responseStatus,
          errorMessage: `Fast2SMS Gateway Error: ${errorDetail}`,
          rawResponse: data,
          normalizedPhone: rawNumber,
        };
      }

      logger.info(`[Fast2SMS] Step 5: SMS successfully accepted by Fast2SMS gateway. Request ID: ${data?.request_id}`);
      return {
        success: true,
        provider: this.name,
        messageId: data?.request_id,
        statusCode: responseStatus,
        rawResponse: data,
        normalizedPhone: rawNumber,
      };
    } catch (err: any) {
      logger.error(`[Fast2SMS] Network or execution error:`, err);
      return {
        success: false,
        provider: this.name,
        errorMessage: `Network error connecting to Fast2SMS: ${err.message}`,
        normalizedPhone: rawNumber,
      };
    }
  }
}
