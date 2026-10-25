import dotenv from 'dotenv';
dotenv.config();

import { OtpService } from '../src/services/otp/otp.service';
import { prisma } from '../src/db/prisma';
import { ISmsProvider, SmsDeliveryResult } from '../src/services/otp/sms/smsProvider.interface';
import { setSmsProviderForTesting } from '../src/services/otp/sms/smsProviderFactory';

async function runMockTests() {
  console.log('\n============================================================');
  console.log('🧪 RUNNING AUTOMATED OTP PROVIDER MOCK TEST SUITE');
  console.log('============================================================\n');

  const testPhone = '9876543210';
  await prisma.otpRequest.deleteMany({ where: { target: testPhone } });

  // TEST 1: MOCK PROVIDER SUCCESS FLOW
  console.log('[TEST 1] Testing OTP Flow when SMS Provider SUCCEEDS:');

  class MockSuccessProvider implements ISmsProvider {
    name = 'MockSuccessGateway';
    async sendOtp(phone: string, otp: string, purpose: string): Promise<SmsDeliveryResult> {
      console.log(`  [MockGateway] Successfully delivered OTP to ${phone} for ${purpose}`);
      return {
        success: true,
        provider: this.name,
        messageId: 'mock_msg_987654321',
        statusCode: 200,
        normalizedPhone: phone,
      };
    }
  }

  setSmsProviderForTesting(new MockSuccessProvider());

  try {
    const sendResult = await OtpService.sendOtp({
      target: testPhone,
      channel: 'SMS',
      purpose: 'signup',
    });

    console.log('  • Send Result:', sendResult.message, `(Provider: ${sendResult.provider})`);
    if (!sendResult.success || sendResult.provider !== 'MockSuccessGateway') {
      throw new Error('Test 1 Failed: Expected successful send with MockSuccessGateway');
    }

    const latestOtp = await prisma.otpRequest.findFirst({
      where: { target: testPhone, purpose: 'signup', consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    console.log('  • OTP record in DB: ID =', latestOtp?.id, ', Hash =', latestOtp?.otpHash.slice(0, 16) + '...');
    if (!latestOtp) throw new Error('Test 1 Failed: OTP record not found in database');

    console.log('  ✅ Mock Provider SUCCESS flow passed!\n');
  } finally {
    setSmsProviderForTesting(null);
  }

  // TEST 2: MOCK PROVIDER FAILURE FLOW
  console.log('[TEST 2] Testing Error Handling when Gateway REJECTS message:');

  class MockFailureProvider implements ISmsProvider {
    name = 'MockFailingGateway';
    async sendOtp(phone: string, otp: string, purpose: string): Promise<SmsDeliveryResult> {
      console.log(`  [MockFailingGateway] Simulating 402 Insufficient Balance or DLT Template Mismatch for ${phone}`);
      return {
        success: false,
        provider: this.name,
        statusCode: 402,
        errorMessage: 'Fast2SMS Gateway Error: Low Balance, Please Recharge or verify DLT template ID',
        normalizedPhone: phone,
      };
    }
  }

  // Clear cooldown
  await prisma.otpRequest.deleteMany({ where: { target: testPhone } });
  setSmsProviderForTesting(new MockFailureProvider());

  try {
    let errorCaught = false;
    try {
      await OtpService.sendOtp({
        target: testPhone,
        channel: 'SMS',
        purpose: 'signup',
      });
    } catch (err: any) {
      errorCaught = true;
      console.log('  • Correctly caught API Error:', err.message);
      if (!err.message.includes('Low Balance') && !err.message.includes('DLT template')) {
        throw new Error(`Test 2 Failed: Expected specific gateway error message, got: ${err.message}`);
      }
    }

    if (!errorCaught) {
      throw new Error('Test 2 Failed: sendOtp should have thrown an error when provider failed!');
    }

    // Verify database OTP record was consumed/invalidated so user is not stuck on an un-sent OTP
    const remainingActiveOtp = await prisma.otpRequest.findFirst({
      where: { target: testPhone, purpose: 'signup', consumedAt: null },
    });

    if (remainingActiveOtp) {
      throw new Error('Test 2 Failed: Un-sent failed OTP should be marked consumed/invalidated!');
    }

    console.log('  ✅ Mock Provider FAILURE handling passed! Gateway rejection was surfaced safely and cleanly.\n');
  } finally {
    setSmsProviderForTesting(null);
    await prisma.otpRequest.deleteMany({ where: { target: testPhone } });
  }

  console.log('============================================================');
  console.log('🎉 ALL MOCK PROVIDER AUTOMATED TESTS PASSED SUCCESSFULLY!');
  console.log('============================================================\n');
}

runMockTests().then(() => process.exit(0)).catch((err) => {
  console.error('❌ Mock test failed:', err);
  process.exit(1);
});
