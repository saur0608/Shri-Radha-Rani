import nodemailer, { Transporter } from 'nodemailer';
import { IEmailProvider } from './emailProvider.interface';
import { generateOtpEmailHtml } from './emailTemplate';
import { ENV } from '../../../config/env';
import { logger } from '../../../utils/logger';

export class NodemailerProvider implements IEmailProvider {
  name = 'Nodemailer';
  private transporter: Transporter | null = null;

  private getTransporter() {
    if (!this.transporter) {
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

  async sendOtp(email: string, otp: string, purpose: string): Promise<boolean> {
    if (!ENV.SMTP_USER || !ENV.SMTP_PASS) {
      logger.error('Nodemailer SMTP credentials not configured');
      return false;
    }

    try {
      const transporter = this.getTransporter();
      const { subject, html, text } = generateOtpEmailHtml(otp, purpose);

      await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to: email,
        subject,
        html,
        text,
      });

      logger.info(`[Nodemailer] Delivered OTP email to ${email} for ${purpose}`);
      return true;
    } catch (err) {
      logger.error('Nodemailer failed to send email:', err);
      return false;
    }
  }
}
