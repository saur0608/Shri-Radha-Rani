import nodemailer, { Transporter } from 'nodemailer';
import { IEmailProvider, EmailDeliveryResult } from './emailProvider.interface';
import { generateOtpEmailHtml } from './emailTemplate';
import { ENV } from '../../../config/env';
import { logger } from '../../../utils/logger';

export class NodemailerProvider implements IEmailProvider {
  name = 'Nodemailer';
  private transporter: Transporter | null = null;

  private getCredentials() {
    const user = ENV.MAIL_USER || ENV.SMTP_USER || 'kabaddi2808@gmail.com';
    const pass = ENV.MAIL_APP_PASSWORD || ENV.SMTP_PASS || '';
    const fromName = ENV.MAIL_FROM_NAME || 'Shri Radha Rani Shringar Bhandar';
    const host = ENV.SMTP_HOST || '';
    const port = ENV.SMTP_PORT || 587;
    return { user, pass, fromName, host, port };
  }

  private getTransporter() {
    if (!this.transporter) {
      const { user, pass, host, port } = this.getCredentials();
      const auth = { user, pass };

      logger.info(`[Nodemailer] Creating SMTP transport: host=${host || 'service:gmail'}, port=${port}, user=${user}`);

      this.transporter = nodemailer.createTransport(
        host
          ? { host, port, secure: port === 465, auth, pool: true }
          : { service: 'gmail', auth, pool: true, maxConnections: 5, maxMessages: 100 }
      );
    }
    return this.transporter;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      const { user } = this.getCredentials();
      logger.info(`[Nodemailer] SMTP connection verified successfully as ${user}`);
      return true;
    } catch (err: any) {
      logger.error(`[Nodemailer] SMTP verification failed: ${err.message}`);
      return false;
    }
  }

  async sendOtp(email: string, otp: string, purpose: string): Promise<EmailDeliveryResult> {
    const maskedEmail = `${email.slice(0, 3)}***@${email.split('@')[1]}`;
    logger.info(`[Nodemailer] Step 1: Initiating OTP email dispatch to ${maskedEmail} for ${purpose}`);

    const { user, pass, fromName } = this.getCredentials();

    if (!pass || pass === 'sample_password') {
      const errMsg = 'SMTP credentials (MAIL_APP_PASSWORD or SMTP_PASS) not configured or using sample placeholder';
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
      const senderAddress = `"${fromName}" <${user}>`;

      logger.info(`[Nodemailer] Step 2: Sending mail from ${senderAddress} to ${maskedEmail}`);
      const startTime = Date.now();

      const info = await transporter.sendMail({
        from: senderAddress,
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
