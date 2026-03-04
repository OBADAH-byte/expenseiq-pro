const createTransporter = require('../config/email');

const sendOTPEmail = async (email, name, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"ExpenseIQ Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your ExpenseIQ Pro Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; background: #020617; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; color: white; }
          .body { padding: 40px; }
          .otp-box { background: #1e293b; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; border: 1px solid #334155; }
          .otp { font-size: 48px; font-weight: bold; color: #6366f1; letter-spacing: 12px; font-family: monospace; }
          .footer { padding: 24px 40px; background: #020617; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💎 ExpenseIQ Pro</h1>
            <p style="margin:8px 0 0; opacity:0.9;">Understand Your Money. Master Your Future.</p>
          </div>
          <div class="body">
            <h2 style="color:#e2e8f0;">Hello, ${name}! 👋</h2>
            <p style="color:#94a3b8; line-height:1.6;">Thank you for signing up for ExpenseIQ Pro. Please verify your email address using the OTP below:</p>
            <div class="otp-box">
              <p style="color:#64748b; margin:0 0 8px; font-size:14px;">Your Verification Code</p>
              <div class="otp">${otp}</div>
              <p style="color:#64748b; margin:8px 0 0; font-size:12px;">Expires in 10 minutes</p>
            </div>
            <p style="color:#94a3b8; font-size:14px;">If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 ExpenseIQ Pro by Obadah Furquan. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"ExpenseIQ Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to ExpenseIQ Pro! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;background:#020617;color:#fff;padding:40px;">
        <div style="max-width:600px;margin:0 auto;background:#0f172a;border-radius:16px;padding:40px;border:1px solid #1e293b;">
          <h1 style="color:#6366f1;">Welcome, ${name}! 🎉</h1>
          <p style="color:#94a3b8;">Your account is verified. Start tracking your expenses and achieving your financial goals.</p>
          <a href="${process.env.CLIENT_URL}/dashboard.html" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">Go to Dashboard</a>
          <p style="color:#475569;font-size:12px;margin-top:24px;">© 2026 Obadah Furquan</p>
        </div>
      </body>
      </html>
    `
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendWelcomeEmail };
