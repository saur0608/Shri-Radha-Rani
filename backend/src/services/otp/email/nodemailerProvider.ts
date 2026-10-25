import nodemailer, { Transporter } from 'nodemailer';
import { IEmailProvider, EmailDeliveryResult } from './emailProvider.interface';
import { generateOtpEmailHtml } from './emailTemplate';
import { ENV } from '../../../config/env';
import { logger } from '../../../utils/logger';

export class NodemailerProvider implements IEmailProvider {
  name = 'Nodemailer';
  private transporter: Transporter | null = null;

  private getTransporter() {
    if (!this.transporter) {
      logger.info(`[Nodemailer] Creating SMTP transport: host=${ENV.SMTP_HOST || 'smtp.gmail.com'}, port=${ENV.SMTP_PORT || 587}, user=${ENV.SMTP_USER || 'none'}`);
      this.transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST || 'smtp.gmail.com',
        port: ENV.SMTP_PORT || 587,
        secure: ENV.SMTP_PORT === 465,
        auth: {
          user: ENV.SMTP_USER,
          pass: ENV.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendOtp(email: string, otp: string, purpose: string): Promise<EmailDeliveryResult> {
    const maskedEmail = `${email.slice(0, 3)}***@${email.split('@')[1]}`;
    logger.info(`[Nodemailer] Step 1: Initiating OTP email dispatch to ${maskedEmail} for ${purpose}`);

    if (!ENV.SMTP_USER || !ENV.SMTP_PASS || ENV.SMTP_PASS === 'sample_password') {
      const errMsg = 'SMTP credentials (SMTP_USER or SMTP_PASS) not configured or using sample placeholder';
      logger.error(`[Nodemailer] Configuration Error: ${errMsg}`);
      return {
        success: false,
        provider: this.name,
        errorMessage: errMsg,
      };
    }

    try {
      const transporter = this.getTransporter();
      const { subject, html, text } = generateOtpEmailHtml(otp, purpose);

      logger.info(`[Nodemailer] Step 2: Sending mail via SMTP host ${ENV.SMTP_HOST}`);
      const startTime = Date.now();

      const info = await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to: email,
        subject,
        html,
        text,
      });

      const elapsedMs = Date.now() - startTime;
      logger.info(`[Nodemailer] Step 3: Delivered OTP email in ${elapsedMs}ms, messageId: ${info.messageId}`);

      return {
        success: true,
        provider: this.name,
        messageId: info.messageId,
        rawResponse: info,
      };
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.code === 'EAUTH') {
        friendlyError = 'SMTP Authentication failed: Incorrect SMTP_USER or SMTP_PASS (for Gmail, ensure 2-step verification is enabled and you are using an App Password).';
      } else if (err.code === 'ESOCKET' || err.code === 'ETIMEDOUT') {
        friendlyError = `Cannot connect to SMTP server ${ENV.SMTP_HOST}:${ENV.SMTP_PORT}. Connection timed out or blocked.`;
      }

      logger.error(`[Nodemailer] Step 3: SMTP delivery failed: ${friendlyError}`, err);

      return {
        success: false,
        provider: this.name,
        errorMessage: friendlyError,
        rawResponse: err,
      };
    }
  }
}
