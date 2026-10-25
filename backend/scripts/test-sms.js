#!/usr/bin/env node

/**
 * Shri Radha Rani Shringar - SMS Provider Diagnostic Test Script
 * Usage:
 *   node scripts/test-sms.js +919876543210
 *   node scripts/test-sms.js 9876543210 --provider=fast2sms
 *   node scripts/test-sms.js 9876543210 --provider=twilio
 *   node scripts/test-sms.js 9876543210 --provider=msg91
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const phoneArg = process.argv.find((arg, i) => i >= 2 && !arg.startsWith('--'));
const providerArg = process.argv.find((arg) => arg.startsWith('--provider='))?.split('=')[1];

if (!phoneArg) {
  console.log('\n❌ ERROR: Phone number is required.');
  console.log('Usage: node scripts/test-sms.js <phone_number> [--provider=fast2sms|twilio|msg91|console]');
  console.log('Example: node scripts/test-sms.js +919876543210\n');
  process.exit(1);
}

const cleanedPhone = phoneArg.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^0/, '');
if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
  console.log(`\n❌ ERROR: Invalid 10-digit Indian mobile number: "${phoneArg}"`);
  console.log('Number must be 10 digits starting with 6, 7, 8, or 9.\n');
  process.exit(1);
}

const activeProvider = providerArg || process.env.SMS_PROVIDER || 'console';
const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

console.log('\n============================================================');
console.log('🌸 SHRI RADHA RANI - SMS GATEWAY DIAGNOSTIC TOOL');
console.log('============================================================');
console.log(`📍 Env File Loaded: ${envPath}`);
console.log(`📱 Target Number Input:      ${phoneArg}`);
console.log(`🔢 Normalized Indian Mobile:  ${cleanedPhone}`);
console.log(`🔑 Test OTP Generated:        ${otpCode}`);
console.log(`🚀 Active SMS Provider:       ${activeProvider.toUpperCase()}`);
console.log(`🖥️  OTP_LOG_CONSOLE Setting:  ${process.env.OTP_LOG_CONSOLE || 'false'}`);
console.log('------------------------------------------------------------');

// Check Environment Variables
console.log('\n[DIAGNOSTIC STEP 1: Environment Variables Check]');
const envChecks = {
  FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY ? `Configured (${process.env.FAST2SMS_API_KEY.slice(0, 6)}...)` : '❌ Missing',
  FAST2SMS_SENDER_ID: process.env.FAST2SMS_SENDER_ID || 'Not set (defaults to RADHAR)',
  FAST2SMS_DLT_TEMPLATE_ID: process.env.FAST2SMS_DLT_TEMPLATE_ID || 'Not set (uses Quick OTP route)',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? `Configured (${process.env.TWILIO_ACCOUNT_SID.slice(0, 8)}...)` : '❌ Missing',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'Configured (hidden)' : '❌ Missing',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '❌ Missing',
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY ? 'Configured (hidden)' : '❌ Missing',
  MSG91_TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID || '❌ Missing',
};

for (const [key, val] of Object.entries(envChecks)) {
  console.log(`  • ${key.padEnd(26)}: ${val}`);
}

async function runTest() {
  console.log('\n[DIAGNOSTIC STEP 2: Executing Live Gateway Dispatch]');

  if (activeProvider === 'fast2sms') {
    await testFast2Sms();
  } else if (activeProvider === 'twilio') {
    await testTwilio();
  } else if (activeProvider === 'msg91') {
    await testMsg91();
  } else {
    testConsole();
  }
}

function testConsole() {
  console.log('\n⚠️  SMS_PROVIDER is set to "console" (or --provider=console).');
  console.log('This mode ONLY prints to stdout and will NEVER send real SMS to any phone.');
  console.log(`[Console Output]: "${otpCode} is your verification OTP for Shri Radha Rani Shringar. Valid for 5 minutes. Radhe Radhe!"`);
  console.log('\n💡 TO SEND REAL SMS:');
  console.log('Set SMS_PROVIDER="fast2sms" or "twilio" or "msg91" in backend/.env, add valid API keys, and set OTP_LOG_CONSOLE="false".');
}

async function testFast2Sms() {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey === 'sample_fast2sms_key') {
    console.log('❌ FATAL: FAST2SMS_API_KEY is not configured or using default placeholder in .env!');
    console.log('Please obtain your API Key from https://fast2sms.com/dashboard/dev-api and update backend/.env.');
    return;
  }

  const url = 'https://www.fast2sms.com/dev/bulkV2';
  let payload;

  if (process.env.FAST2SMS_DLT_TEMPLATE_ID && process.env.FAST2SMS_DLT_TEMPLATE_ID !== '1107161234567890123') {
    console.log(`  • Route: DLT Template (Sender: ${process.env.FAST2SMS_SENDER_ID}, Template: ${process.env.FAST2SMS_DLT_TEMPLATE_ID})`);
    payload = {
      route: 'dlt',
      sender_id: process.env.FAST2SMS_SENDER_ID || 'RADHAR',
      message: process.env.FAST2SMS_DLT_TEMPLATE_ID,
      variables_values: otpCode,
      flash: '0',
      numbers: cleanedPhone,
    };
  } else {
    console.log('  • Route: Quick OTP (No DLT template ID provided; testing via Fast2SMS instant OTP route)');
    payload = {
      route: 'otp',
      variables_values: otpCode,
      numbers: cleanedPhone,
    };
  }

  console.log(`  • POST URL: ${url}`);
  console.log(`  • Payload:  ${JSON.stringify(payload)}`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const elapsed = Date.now() - startTime;
    const json = await response.json().catch(() => null);

    console.log(`\n[DIAGNOSTIC STEP 3: Gateway Response]`);
    console.log(`  • HTTP Status: ${response.status} ${response.statusText} (${elapsed}ms)`);
    console.log(`  • Response Body:`, JSON.stringify(json, null, 2));

    if (json && json.return === true) {
      console.log('\n✅ SUCCESS: Fast2SMS accepted the message!');
      console.log(`  • Request ID: ${json.request_id}`);
      console.log(`  • Message: ${json.message}`);
      console.log(`Check mobile phone ${cleanedPhone} in the next 10-30 seconds.`);
    } else {
      console.log('\n❌ GATEWAY REJECTION:');
      const msg = json?.message || 'Unknown response from Fast2SMS';
      console.log(`  • Reason: ${JSON.stringify(msg)}`);

      if (json?.status_code === 411 || (Array.isArray(msg) && msg[0]?.includes('Authorization'))) {
        console.log('  🔍 Diagnosis: Invalid FAST2SMS_API_KEY. Log in to fast2sms.com and verify your API key.');
      } else if (json?.status_code === 402 || (Array.isArray(msg) && msg[0]?.includes('Balance'))) {
        console.log('  🔍 Diagnosis: Insufficient wallet balance in your Fast2SMS account.');
      } else if (Array.isArray(msg) && msg[0]?.includes('Template')) {
        console.log('  🔍 Diagnosis: DLT Template ID not found or not approved on Fast2SMS dashboard.');
      }
    }
  } catch (err) {
    console.log(`\n❌ NETWORK ERROR connecting to Fast2SMS: ${err.message}`);
  }
}

async function testTwilio() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    console.log('❌ FATAL: Twilio credentials missing in backend/.env!');
    console.log('Please ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set.');
    return;
  }

  const formattedPhone = `+91${cleanedPhone}`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const authHeader = Buffer.from(`${sid}:${token}`).toString('base64');

  const formData = new URLSearchParams();
  formData.append('To', formattedPhone);
  formData.append('From', from);
  formData.append('Body', `${otpCode} is your verification code for Shri Radha Rani Shringar. Valid for 5 minutes.`);

  console.log(`  • POST URL: ${url}`);
  console.log(`  • To:   ${formattedPhone}`);
  console.log(`  • From: ${from}`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const elapsed = Date.now() - startTime;
    const json = await response.json().catch(() => null);

    console.log(`\n[DIAGNOSTIC STEP 3: Gateway Response]`);
    console.log(`  • HTTP Status: ${response.status} ${response.statusText} (${elapsed}ms)`);
    console.log(`  • Response Body:`, JSON.stringify(json, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS: Twilio queued message!');
      console.log(`  • Twilio Message SID: ${json.sid}`);
      console.log(`  • Status: ${json.status}`);
      console.log(`Check mobile phone ${formattedPhone} in the next 10-30 seconds.`);
    } else {
      console.log('\n❌ TWILIO REJECTION:');
      console.log(`  • Error Code: ${json?.code}`);
      console.log(`  • Message:    ${json?.message}`);

      if (json?.code === 21608) {
        console.log('\n  🔍 ROOT CAUSE FOUND (Twilio Trial Account):');
        console.log(`  Twilio trial accounts can ONLY send SMS to verified caller IDs.`);
        console.log(`  To fix this:`);
        console.log(`  1. Verify ${formattedPhone} at https://console.twilio.com/us1/develop/phone-numbers/manage/verified`);
        console.log(`  2. OR upgrade your Twilio account to a paid plan.`);
      } else if (json?.code === 21211) {
        console.log('\n  🔍 ROOT CAUSE: Invalid phone number format.');
      } else if (json?.code === 20003) {
        console.log('\n  🔍 ROOT CAUSE: Invalid Twilio Account SID or Auth Token.');
      }
    }
  } catch (err) {
    console.log(`\n❌ NETWORK ERROR connecting to Twilio: ${err.message}`);
  }
}

async function testMsg91() {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authKey || !templateId) {
    console.log('❌ FATAL: MSG91_AUTH_KEY or MSG91_TEMPLATE_ID missing in backend/.env!');
    return;
  }

  const formattedPhone = `91${cleanedPhone}`;
  const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${formattedPhone}&otp=${otpCode}`;

  console.log(`  • POST URL: ${url}`);
  console.log(`  • To: ${formattedPhone}`);
  console.log(`  • Template ID: ${templateId}`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json',
      },
    });

    const elapsed = Date.now() - startTime;
    const json = await response.json().catch(() => null);

    console.log(`\n[DIAGNOSTIC STEP 3: Gateway Response]`);
    console.log(`  • HTTP Status: ${response.status} ${response.statusText} (${elapsed}ms)`);
    console.log(`  • Response Body:`, JSON.stringify(json, null, 2));

    if (response.ok && json?.type === 'success') {
      console.log('\n✅ SUCCESS: MSG91 accepted message!');
    } else {
      console.log(`\n❌ MSG91 REJECTION: ${json?.message || 'Unknown error'}`);
    }
  } catch (err) {
    console.log(`\n❌ NETWORK ERROR connecting to MSG91: ${err.message}`);
  }
}

runTest().then(() => {
  console.log('\n============================================================\n');
});
