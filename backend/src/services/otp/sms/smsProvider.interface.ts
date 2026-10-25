export interface ISmsProvider {
  name: string;
  sendOtp(phone: string, otp: string, purpose: string): Promise<boolean>;
}
