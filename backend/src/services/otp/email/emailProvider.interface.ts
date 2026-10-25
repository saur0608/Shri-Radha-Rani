export interface EmailDeliveryResult {
  success: boolean;
  provider: string;
  messageId?: string;
  statusCode?: number;
  errorMessage?: string;
  rawResponse?: any;
}

export interface IEmailProvider {
  name: string;
  sendOtp(email: string, otp: string, purpose: string): Promise<EmailDeliveryResult>;
}
