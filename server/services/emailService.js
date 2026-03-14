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

/**
 * Sends a security alert email with premium UI.
 */
const sendSecurityAlertEmail = async (toEmail, userName, details) => {
  const useAlt = toEmail.toLowerCase().includes('sahanasakthivel2018@gmail.com');
  const transporter = useAlt ? transporter2 : transporter1;
  const senderEmail = useAlt ? process.env.SMTP_USER_ALT : process.env.SMTP_USER;

  const { alertType = 'Security Warning', message, ip, userAgent, timestamp = new Date() } = details;

  // Choose color based on alert type/severity
  const isCritical = alertType.toLowerCase().includes('lock') || alertType.toLowerCase().includes('critical');
  const primaryColor = isCritical ? '#dc2626' : '#f59e0b';
  const icon = isCritical ? '🚫' : '⚠️';

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Security Alert</title>
  </head>
  <body style="margin:0;padding:0;background:#fef2f2;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(220, 38, 38, 0.1);">
            <!-- Header -->
            <tr>
              <td style="background:${primaryColor};padding:40px;text-align:center;">
                <div style="font-size:48px;margin-bottom:12px;">${icon}</div>
                <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">
                  Security Alert
                </h1>
                <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;font-weight:500;">
                  Suspicious Activity Detected
                </p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <p style="color:#1f2937;font-size:16px;margin:0 0 24px;">
                  Hello <strong>${userName}</strong>,
                </p>
                <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 24px;">
                  This is an automated security notification regarding your Graphical Password Authenticator account. We've detected activity that requires your attention.
                </p>
                
                <!-- Alert Details Box -->
                <div style="background:#fdf2f2;border:1px solid #fee2e2;border-radius:12px;padding:24px;margin-bottom:30px;">
                  <h3 style="color:${primaryColor};font-size:14px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Alert Details</h3>
                  <table width="100%" style="font-size:14px;color:#4b5563;">
                    <tr>
                      <td style="padding:6px 0;font-weight:600;width:120px;">Event Type:</td>
                      <td style="padding:6px 0;">${alertType.replace(/_/g, ' ')}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-weight:600;">Status:</td>
                      <td style="padding:6px 0;color:${primaryColor};font-weight:600;">Action Taken</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-weight:600;">Description:</td>
                      <td style="padding:6px 0;line-height:1.5;">${message}</td>
                    </tr>
                  </table>
                </div>

                <!-- Context Data -->
                <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:30px;">
                  <h3 style="color:#6b7280;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Login Context</h3>
                  <table width="100%" style="font-size:13px;color:#6b7280;">
                    <tr>
                      <td style="padding:4px 0;width:100px;">IP Address:</td>
                      <td style="padding:4px 0;color:#1f2937;">${ip || 'Unknown'}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;">Device/OS:</td>
                      <td style="padding:4px 0;color:#1f2937;">${userAgent || 'Unknown'}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;">Time (UTC):</td>
                      <td style="padding:4px 0;color:#1f2937;">${timestamp.toUTCString()}</td>
                    </tr>
                  </table>
                </div>

                <!-- Security Action -->
                <div style="text-align:center;margin-bottom:30px;">
                  <p style="color:#6b7280;font-size:14px;margin-bottom:20px;">
                    If this was NOT you, please secure your account immediately.
                  </p>
                  <a href="${process.env.FRONTEND_URL}/forgot-password" style="display:inline-block;background:${primaryColor};color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 4px 12px rgba(220,38,38,0.2);">
                    Reset My Password
                  </a>
                </div>

                <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;line-height:1.5;">
                  You received this mandatory security alert because of activity on your account. To help protect you, we cannot opt-out of security-related emails.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;padding:25px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                  &copy; ${new Date().getFullYear()} Graphical Password Authenticator Security Team
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
    await transporter.sendMail({
      from: `"Graphical Auth Security" <${senderEmail}>`,
      to: getRecipientEmail(toEmail),
      subject: `🚨 Security Alert: ${alertType.replace(/_/g, ' ').toUpperCase()}`,
      text: `Security Alert for ${userName}\n\nType: ${alertType}\nMessage: ${message}\nIP: ${ip}\nTime: ${timestamp.toUTCString()}\n\nIf this was not you, please reset your password immediately.`,
      html,
    });
  } catch (error) {
    console.error('[SECURITY EMAIL] Failed:', error);
  }
};

/**
 * Sends a forgot password OTP email.
 */
const sendForgotPasswordEmail = async (toEmail, userName, otp) => {
  const useAlt = toEmail.toLowerCase().includes('sahanasakthivel2018@gmail.com');
  const transporter = useAlt ? transporter2 : transporter1;
  const senderEmail = useAlt ? process.env.SMTP_USER_ALT : process.env.SMTP_USER;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Reset Your Password</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79, 70, 229, 0.1);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);padding:36px 40px;text-align:center;">
                <div style="font-size:36px;margin-bottom:8px;">🔑</div>
                <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Password Reset Request</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:36px 40px;">
                <p style="color:#374151;font-size:15px;margin:0 0 20px;">
                  Hi <strong>${userName}</strong>,
                </p>
                <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 28px;">
                  We received a request to reset your graphical password. Use the following code to proceed:
                </p>
                <!-- OTP Box -->
                <div style="background:#f5f3ff;border:2px solid #e0e7ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                  <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#4f46e5;font-family:monospace;">
                    ${otp}
                  </span>
                </div>
                <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;">
                  This code will expire in 10 minutes. If you did not request a password reset, please ignore this email or contact support.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                  Graphical Password Authenticator Team
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
    await transporter.sendMail({
      from: `"Graphical Auth Support" <${senderEmail}>`,
      to: getRecipientEmail(toEmail),
      subject: `🔑 ${otp} is your password reset code`,
      html,
    });
  } catch (error) {
    console.error('[FORGOT PASSWORD EMAIL] Failed:', error);
  }
};

module.exports = { sendOtpEmail, sendSecurityAlertEmail, sendForgotPasswordEmail };

