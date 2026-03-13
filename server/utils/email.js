const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendSecurityAlertEmail = async (userEmail, userName, attemptDetails) => {
  // If SMTP isn't configured, just log it out (development mode)
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL SIMULATION] Security alert sent to ${userEmail} regarding: ${attemptDetails.message}`);
    return;
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-w-2xl bg-white p-8 rounded-xl shadow-md border-t-4 border-red-500">
          <h2 style="color: #dc2626; font-size: 24px; margin-bottom: 20px;">Security Alert: Suspicious Login Attempt</h2>
          <p style="font-size: 16px; color: #333;">Hello ${userName},</p>
          <p style="font-size: 16px; color: #333;">We detected a suspicious login attempt on your account.</p>
          
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #991b1b;">Incident Details:</p>
            <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
              <li><strong>Time:</strong> ${new Date(attemptDetails.timestamp).toUTCString()}</li>
              <li><strong>IP Address:</strong> ${attemptDetails.ip}</li>
              <li><strong>Device/Browser:</strong> ${attemptDetails.userAgent}</li>
              <li><strong>Reason:</strong> ${attemptDetails.message}</li>
            </ul>
          </div>

          <p style="font-size: 16px; color: #333;">
            If this was you, you can safely ignore this email. Your graphical password prevented access.
          </p>
          <p style="font-size: 16px; color: #333; font-weight: bold;">
            If this wasn't you, your account is still secure, but please stay vigilant.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            Memory-Assisted Graphical Password Security Team
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Graphical Auth Security" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: '🚨 Security Alert: Suspicious Login Attempt Detected',
      html: htmlContent,
    });
  } catch (error) {
    console.error('Email failed to send:', error);
  }
};

const sendOTPEmail = async (userEmail, userName, otp) => {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL SIMULATION] Reset OTP for ${userEmail}: ${otp}`);
    return;
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-w-2xl bg-white p-8 rounded-xl shadow-md border-t-4 border-indigo-500">
          <h2 style="color: #4f46e5; font-size: 24px; margin-bottom: 20px;">Verification Code: ${otp}</h2>
          <p style="font-size: 16px; color: #333;">Hello ${userName},</p>
          <p style="font-size: 16px; color: #333;">You requested to reset your graphical password sequence. Use the code below to proceed:</p>
          
          <div style="background-color: #f5f3ff; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; font-size: 32px; font-weight: 800; color: #4338ca; letter-spacing: 5px;">${otp}</p>
          </div>

          <p style="font-size: 14px; color: #666;">
            This code will expire in 10 minutes. If you did not request this, please ignore this email.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            Memory-Assisted Graphical Password Security Team
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Graphical Auth Support" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `🗝️ ${otp} is your verification code`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('OTP Email failed to send:', error);
  }
};

module.exports = { sendSecurityAlertEmail, sendOTPEmail };
