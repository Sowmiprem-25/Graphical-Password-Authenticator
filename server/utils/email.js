const nodemailer = require('nodemailer');

const transporter1 = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const transporter2 = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER_ALT,
    pass: process.env.SMTP_PASS_ALT,
  },
});

const getTransporter = (email) => {
  if (email.toLowerCase().includes('sahanasakthivel2018@gmail.com')) {
    return { transporter: transporter2, sender: process.env.SMTP_USER_ALT };
  }
  return { transporter: transporter1, sender: process.env.SMTP_USER };
};

const sendSecurityAlertEmail = async (userEmail, userName, attemptDetails) => {
  const { transporter, sender } = getTransporter(userEmail);

  if (!sender) {
    console.log(`[EMAIL SIMULATION] Security alert sent to ${userEmail}`);
    return;
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-w-2xl bg-white p-8 rounded-xl shadow-md border-t-4 border-red-500">
          <h2 style="color: #dc2626; font-size: 24px; margin-bottom: 20px;">Security Alert</h2>
          <p>Hello ${userName}, we detected a suspicious attempt.</p>
          <p><strong>Reason:</strong> ${attemptDetails.message}</p>
          <hr/>
          <p style="font-size: 12px; color: #999;">Graphical Auth Team</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Graphical Auth Security" <${sender}>`,
      to: userEmail,
      subject: '🚨 Security Alert',
      html: htmlContent,
    });
  } catch (error) {
    console.error('Email failed:', error);
  }
};

const sendOTPEmail = async (userEmail, userName, otp) => {
  const { transporter, sender } = getTransporter(userEmail);

  if (!sender) {
    console.log(`[EMAIL SIMULATION] OTP for ${userEmail}: ${otp}`);
    return;
  }

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-w-2xl bg-white p-8 rounded-xl shadow-md border-t-4 border-indigo-500">
          <h2 style="color: #4f46e5; font-size: 24px;">Verification Code: ${otp}</h2>
          <p>Hello ${userName}, use the code below to reset your graphical sequence.</p>
          <div style="background:#f5f3ff; padding:25px; border-radius:12px; text-align:center;">
            <p style="font-size:32px; font-weight:800; color:#4338ca; letter-spacing:5px;">${otp}</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Graphical Auth Support" <${sender}>`,
      to: userEmail,
      subject: `🗝️ ${otp} is your verification code`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('OTP Email failed:', error);
  }
};

module.exports = { sendSecurityAlertEmail, sendOTPEmail };
