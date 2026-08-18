const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NODE_ENV } = require('../../config/config');

const createTransporter = () => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    // Console mock transporter for development
    return {
      sendMail: async (options) => {
        console.log('\n📧 [EMAIL MOCK] ─────────────────────────────────');
        console.log(`   To:      ${options.to}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   Body:    ${options.text || options.html}`);
        console.log('────────────────────────────────────────────────\n');
        return { messageId: `mock-${Date.now()}` };
      },
    };
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT == 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const sendOTPEmail = async (email, otp, name = 'User') => {
  const transporter = createTransporter();
  return await transporter.sendMail({
    from: `"SecureVault" <${SMTP_USER || 'noreply@securevault.dev'}>`,
    to: email,
    subject: '🔐 Your SecureVault OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0f1e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #00d4ff;">SecureVault</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your One-Time Password is:</p>
        <div style="background: #1a2236; padding: 20px; border-radius: 8px; text-align: center; letter-spacing: 8px; font-size: 32px; color: #39ff14; font-weight: bold; font-family: monospace;">
          ${otp}
        </div>
        <p style="color: #aaa; margin-top: 20px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="color: #666; font-size: 12px;">SecureVault – Information Security Suite</p>
      </div>
    `,
    text: `Your SecureVault OTP is: ${otp}. Expires in 10 minutes.`,
  });
};

const sendPasswordResetEmail = async (email, resetLink, name = 'User') => {
  const transporter = createTransporter();
  return await transporter.sendMail({
    from: `"SecureVault" <${SMTP_USER || 'noreply@securevault.dev'}>`,
    to: email,
    subject: '🔑 SecureVault Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0f1e; color: #fff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #00d4ff;">SecureVault</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Click the button below to reset your password. This link expires in 30 minutes.</p>
        <a href="${resetLink}" style="display: inline-block; margin: 20px 0; padding: 12px 28px; background: #00d4ff; color: #0a0f1e; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
        <p style="color: #aaa;">If you did not request this, ignore this email.</p>
      </div>
    `,
    text: `Reset your password: ${resetLink}`,
  });
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
