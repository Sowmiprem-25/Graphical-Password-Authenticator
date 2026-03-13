const nodemailer = require('nodemailer');

// ── Transporter 1 (Default) ───────────────────────────────────
const transporter1 = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Transporter 2 (Alternate) ─────────────────────────────────
const transporter2 = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER_ALT,
    pass: process.env.SMTP_PASS_ALT,
  },
});

const getRecipientEmail = (toEmail) => {
  if (process.env.NODE_ENV === 'development' && process.env.REDIRECT_ALL_EMAILS === 'true') {
    return process.env.SMTP_USER;
  }
  return toEmail;
};

/**
 * Sends a 6-digit OTP email.
 * Picks the transporter based on the target email.
 */
const sendOtpEmail = async (toEmail, otp, userName = 'User') => {
  const expiryMinutes = Math.ceil((parseInt(process.env.OTP_EXPIRES_MS) || 300000) / 60000);
  
  // Decide which account to send from
  const useAlt = toEmail.toLowerCase().includes('sahanasakthivel2018@gmail.com');
  const transporter = useAlt ? transporter2 : transporter1;
  const senderEmail = useAlt ? process.env.SMTP_USER_ALT : process.env.SMTP_USER;

  console.log(`[EMAIL] Sending from: ${senderEmail} to: ${toEmail}`);

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Your OTP Code</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 40px;text-align:center;">
                <div style="font-size:36px;margin-bottom:8px;">🔐</div>
                <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                  Graphical Auth — Verification Code
                </h1>
                <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">
                  Multi-Layer Security Verification
                </p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:36px 40px;">
                <p style="color:#374151;font-size:15px;margin:0 0 20px;">
                  Hi <strong>${userName}</strong>,
                </p>
                <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 8px;">
                  Login requested for account: <strong style="color:#4f46e5;">${toEmail}</strong>
                </p>
                <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 28px;">
                  The graphical password was verified. Please use the code below to complete sign-in.
                </p>
                <!-- OTP Box -->
                <div style="background:#f0f0ff;border:2px dashed #7c3aed;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                  <p style="color:#4f46e5;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">
                    Your One-Time Password
                  </p>
                  <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#1e1b4b;font-family:'Courier New',monospace;">
                    ${otp}
                  </span>
                  <p style="color:#9ca3af;font-size:12px;margin:12px 0 0;">
                    ⏱ Expires in <strong>${expiryMinutes} minutes</strong>
                  </p>
                </div>
                <!-- Security note -->
                <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:4px;padding:12px 16px;margin-bottom:20px;">
                  <p style="color:#b91c1c;font-size:13px;margin:0;font-weight:600;">⚠ Security Notice</p>
                  <p style="color:#dc2626;font-size:12px;margin:6px 0 0;line-height:1.5;">
                    Never share this code with anyone. Our team will never ask for it. If you didn't request this, please contact support immediately.
                  </p>
                </div>
                <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
                  This code is valid for a single use only.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                  Graphical Password Authenticator &copy; ${new Date().getFullYear()}
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

  try {
    const info = await transporter.sendMail({
      from: `"Graphical Auth" <${senderEmail}>`,
      to: getRecipientEmail(toEmail),
      subject: `🔐 OTP for ${toEmail} — ${otp} (expires in ${expiryMinutes} min)`,
      text: `Hi ${userName},\n\nLogin requested for: ${toEmail}\nYour one-time verification code is: ${otp}\n\nThis code expires in ${expiryMinutes} minutes. Do not share it with anyone.\n\n— Graphical Password Authenticator`,
      html,
    });
    console.log('[EMAIL] Success! Message ID:', info.messageId);
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error);
    throw error;
  }
};

module.exports = { sendOtpEmail };
