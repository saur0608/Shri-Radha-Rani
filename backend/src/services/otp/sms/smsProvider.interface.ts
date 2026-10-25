export interface SmsDeliveryResult {
  success: boolean;
  provider: string;
  messageId?: string;
  statusCode?: number;
  errorMessage?: string;
  rawResponse?: any;
  normalizedPhone?: string;
}

export interface ISmsProvider {
  name: string;
  sendOtp(phone: string, otp: string, purpose: string): Promise<SmsDeliveryResult>;
}
