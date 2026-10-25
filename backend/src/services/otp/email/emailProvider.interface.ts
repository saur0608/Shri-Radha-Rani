export interface IEmailProvider {
  name: string;
  sendOtp(email: string, otp: string, purpose: string): Promise<boolean>;
}
