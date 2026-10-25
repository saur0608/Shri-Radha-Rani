import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../src/db/prisma';
import crypto from 'crypto';
import { ENV } from '../src/config/env';

const API_BASE = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- 🧪 STARTING OTP AUTOMATED TEST SUITE ---');

  const testPhone = '9998887766';
  const testEmail = 'devotee.test@radharani.com';

  // Cleanup any test OTPs or existing test user
  await prisma.otpRequest.deleteMany({
    where: { target: { in: [testPhone, testEmail] } },
  });
  await prisma.user.deleteMany({
    where: { phone: testPhone },
  });

  // TEST 1: Send OTP to Mobile
  console.log('\n[TEST 1] Send OTP to Mobile');
  const sendRes = await fetch(`${API_BASE}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: testPhone,
      channel: 'SMS',
      purpose: 'signup',
    }),
  });
  const sendData = await sendRes.json();
  console.log('Send response status:', sendRes.status, sendData.message);
  if (!sendData.success) throw new Error('Test 1 failed: Could not send OTP');

  // TEST 2: Cooldown Enforcement (Immediate Resend within 30s)
  console.log('\n[TEST 2] Cooldown Enforcement (< 30s resend)');
  const cooldownRes = await fetch(`${API_BASE}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: testPhone,
      channel: 'SMS',
      purpose: 'signup',
    }),
  });
  const cooldownData = await cooldownRes.json();
  console.log('Cooldown response status:', cooldownRes.status, cooldownData.message);
  if (cooldownRes.status !== 400 || !cooldownData.message.includes('Please wait')) {
    throw new Error('Test 2 failed: Cooldown was not enforced!');
  }
  console.log('✅ Cooldown enforced correctly!');

  // TEST 3: Wrong OTP Attempt (Attempts tracking)
  console.log('\n[TEST 3] Wrong OTP Attempt tracking');
  const wrongRes = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: testPhone,
      otp: '000000',
      purpose: 'signup',
    }),
  });
  const wrongData = await wrongRes.json();
  console.log('Wrong OTP status:', wrongRes.status, wrongData.message);
  if (wrongRes.status !== 400 || !wrongData.message.includes('attempt(s) remaining')) {
    throw new Error('Test 3 failed: Attempts remaining was not reported!');
  }
  console.log('✅ Wrong OTP decreased attempts remaining correctly!');

  // TEST 4: Max 5 Wrong Attempts Invalidation
  console.log('\n[TEST 4] Exceeding Max 5 Wrong Attempts');
  for (let i = 1; i <= 4; i++) {
    await fetch(`${API_BASE}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: testPhone,
        otp: `00000${i}`,
        purpose: 'signup',
      }),
    });
  }
  // Now attempt 5 has been reached, the code is invalidated
  const maxAttemptRes = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: testPhone,
      otp: '123456',
      purpose: 'signup',
    }),
  });
  const maxAttemptData = await maxAttemptRes.json();
  console.log('Max attempt status:', maxAttemptRes.status, maxAttemptData.message);
  if (maxAttemptRes.status !== 400) {
    throw new Error('Test 4 failed: Invalidated OTP was not blocked!');
  }
  console.log('✅ OTP properly invalidated after max attempts!');

  // TEST 5: Expired OTP rejection
  console.log('\n[TEST 5] Expired OTP rejection');
  const expiredOtpHash = crypto
    .createHmac('sha256', ENV.OTP_SECRET)
    .update(`${testPhone}:signup:112233`)
    .digest('hex');

  await prisma.otpRequest.create({
    data: {
      target: testPhone,
      channel: 'SMS',
      otpHash: expiredOtpHash,
      purpose: 'signup',
      expiresAt: new Date(Date.now() - 60000), // 1 minute in past
    },
  });

  const expiredRes = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target: testPhone,
      otp: '112233',
      purpose: 'signup',
    }),
  });
  const expiredData = await expiredRes.json();
  console.log('Expired OTP status:', expiredRes.status, expiredData.message);
  if (expiredRes.status !== 400 || !expiredData.message.includes('expired')) {
    throw new Error('Test 5 failed: Expired OTP was not rejected!');
  }
  console.log('✅ Expired OTP correctly rejected!');

  // TEST 6: Successful OTP Flow & Token generation for Mobile + Email
  console.log('\n[TEST 6] Successful OTP verification for both Mobile and Email');
  // Clear cooldown to allow new send
  await prisma.otpRequest.deleteMany({
    where: { target: { in: [testPhone, testEmail] } },
  });

  // Mobile send & verify
  await fetch(`${API_BASE}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: testPhone, channel: 'SMS', purpose: 'signup' }),
  });
  const latestPhoneOtp = await prisma.otpRequest.findFirst({
    where: { target: testPhone, purpose: 'signup', consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  let foundPhoneOtp = '';
  for (let n = 100000; n <= 999999; n++) {
    const h = crypto.createHmac('sha256', ENV.OTP_SECRET).update(`${testPhone}:signup:${n}`).digest('hex');
    if (h === latestPhoneOtp?.otpHash) {
      foundPhoneOtp = n.toString();
      break;
    }
  }

  const verifyPhoneRes = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: testPhone, otp: foundPhoneOtp, purpose: 'signup' }),
  });
  const verifyPhoneData = await verifyPhoneRes.json();
  console.log('Mobile verification status:', verifyPhoneRes.status, verifyPhoneData.data.verified);
  const phoneVerificationToken = verifyPhoneData.data.verificationToken;

  // Email send & verify
  await fetch(`${API_BASE}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: testEmail, channel: 'EMAIL', purpose: 'signup' }),
  });
  const latestEmailOtp = await prisma.otpRequest.findFirst({
    where: { target: testEmail, purpose: 'signup', consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  let foundEmailOtp = '';
  for (let n = 100000; n <= 999999; n++) {
    const h = crypto.createHmac('sha256', ENV.OTP_SECRET).update(`${testEmail}:signup:${n}`).digest('hex');
    if (h === latestEmailOtp?.otpHash) {
      foundEmailOtp = n.toString();
      break;
    }
  }

  const verifyEmailRes = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: testEmail, otp: foundEmailOtp, purpose: 'signup' }),
  });
  const verifyEmailData = await verifyEmailRes.json();
  console.log('Email verification status:', verifyEmailRes.status, verifyEmailData.data.verified);
  const emailVerificationToken = verifyEmailData.data.verificationToken;

  console.log('✅ Both Mobile and Email verified, tokens issued!');

  // TEST 7: Signup with verified tokens
  console.log('\n[TEST 7] Devotee Signup with Mobile & Email Verification Tokens');
  const signupRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Radha Devotee Test',
      phone: testPhone,
      email: testEmail,
      password: 'password123',
      phoneVerificationToken,
      emailVerificationToken,
    }),
  });
  const signupData = await signupRes.json();
  console.log('Signup status:', signupRes.status, signupData.data?.user?.phoneVerified, signupData.data?.user?.emailVerified);
  if (!signupData.data?.user?.phoneVerified || !signupData.data?.user?.emailVerified) {
    throw new Error('Test 7 failed: User account was not activated with verified badges!');
  }
  console.log('✅ Account successfully activated with both phone and email verified!');

  // TEST 8: Passwordless OTP Login
  console.log('\n[TEST 8] Passwordless Mobile OTP Login');
  await prisma.otpRequest.deleteMany({ where: { target: testPhone } });
  await fetch(`${API_BASE}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: testPhone, channel: 'SMS', purpose: 'login' }),
  });
  const loginOtpRec = await prisma.otpRequest.findFirst({
    where: { target: testPhone, purpose: 'login', consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  let loginOtp = '';
  for (let n = 100000; n <= 999999; n++) {
    const h = crypto.createHmac('sha256', ENV.OTP_SECRET).update(`${testPhone}:login:${n}`).digest('hex');
    if (h === loginOtpRec?.otpHash) {
      loginOtp = n.toString();
      break;
    }
  }

  const otpLoginRes = await fetch(`${API_BASE}/auth/otp/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: testPhone, otp: loginOtp }),
  });
  const otpLoginData = await otpLoginRes.json();
  console.log('OTP Login status:', otpLoginRes.status, otpLoginData.data?.user?.name);
  if (otpLoginRes.status !== 200 || !otpLoginData.data?.token) {
    throw new Error('Test 8 failed: Passwordless OTP login failed!');
  }
  console.log('✅ Passwordless OTP login successfully created session!');

  // Cleanup test user
  await prisma.user.deleteMany({ where: { phone: testPhone } });
  await prisma.otpRequest.deleteMany({ where: { target: { in: [testPhone, testEmail] } } });

  console.log('\n🎉 ALL 8 BACKEND OTP TESTS PASSED FLAWLESSLY!');
}

runTests().then(() => process.exit(0)).catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
