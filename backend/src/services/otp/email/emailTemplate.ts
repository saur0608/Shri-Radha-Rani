export function generateOtpEmailHtml(otp: string, purpose: string): { subject: string; html: string; text: string } {
  const purposeMap: Record<string, { en: string; hi: string }> = {
    signup: { en: 'Sacred Account Verification', hi: 'खाता सत्यापन' },
    login: { en: 'Secure Devotee Login', hi: 'भक्त लॉगिन' },
    checkout: { en: 'Order Placement Verification', hi: 'ऑर्डर सत्यापन' },
    reset: { en: 'Password Reset', hi: 'पासवर्ड रीसेट' },
    profile: { en: 'Profile Update Verification', hi: 'प्रोफ़ाइल अद्यतन' },
  };

  const title = purposeMap[purpose]?.en || 'Verification Code';
  const titleHi = purposeMap[purpose]?.hi || 'सत्यापन कोड';
  const subject = `🌸 ${otp} is your verification code for Shri Radha Rani Shringar`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#fdfbf7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fdfbf7;padding:30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width:540px;background:#ffffff;border:1px solid #fde68a;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(225,29,89,0.08);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #be1245 0%, #e11d59 50%, #d97706 100%);padding:36px 24px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">🌸</div>
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px;">
                श्री राधा रानी श्रृंगार
              </h1>
              <p style="color:#fef3c7;margin:6px 0 0 0;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                Directly from Holy Vrindavan Dham
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 32px;text-align:center;">
              <span style="display:inline-block;padding:6px 14px;background:#fef3c7;color:#92400e;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                ${title} • ${titleHi}
              </span>

              <h2 style="font-size:20px;color:#1c1917;margin:20px 0 10px 0;font-weight:800;">
                Your One-Time Password (OTP)
              </h2>

              <p style="font-size:14px;color:#57534e;line-height:1.6;margin:0 0 24px 0;">
                Radhe Radhe! Please use the following 6-digit code to complete your verification for Thakurji &amp; Kishori Ji seva.
              </p>

              <!-- 6-Digit OTP Box -->
              <div style="background:#fff1f4;border:2px dashed #fb7193;border-radius:18px;padding:18px 24px;display:inline-block;margin:0 auto 24px auto;">
                <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#be1245;font-family:monospace;">
                  ${otp}
                </span>
              </div>

              <!-- Expiry & Security Notice -->
              <div style="background:#f9f5ec;border-radius:12px;padding:14px;font-size:12px;color:#78350f;text-align:left;line-height:1.6;">
                <p style="margin:0 0 4px 0;">⏳ <strong>Valid for:</strong> 5 minutes only (Single use).</p>
                <p style="margin:0;">🔒 <strong>Security Warning:</strong> Never share this OTP with anyone, including temple support.</p>
              </div>

              <p style="font-size:12px;color:#a8a29e;margin:24px 0 0 0;">
                If you did not request this verification code, please ignore this email safely.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1c1917;padding:24px;text-align:center;color:#a8a29e;font-size:11px;line-height:1.6;">
              <p style="margin:0;color:#fcd34d;font-weight:700;">
                जय जय श्री राधे! जय श्री कृष्णा!
              </p>
              <p style="margin:6px 0 0 0;">
                Raman Reti Marg, Near Prem Mandir, Holy Vrindavan Dham, Mathura, UP - 281121<br>
                Dedicated to bringing sacred Vrindavan aesthetics to your home altar.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Radhe Radhe!

Your One-Time Password (OTP) for Shri Radha Rani Shringar (${title}) is:
${otp}

This code is valid for 5 minutes and single use. Do not share this OTP with anyone.

Shri Radha Rani Shringar
Holy Vrindavan Dham
`;

  return { subject, html, text };
}
