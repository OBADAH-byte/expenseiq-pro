process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    tls: {
      rejectUnauthorized: false
    },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });
};

const sendOTPEmail = async (email, name, otp) => {
  console.log(`📧 Attempting to send OTP to: ${email}`);
  console.log(`📧 Using SMTP: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
  console.log(`📧 Auth user: ${process.env.EMAIL_USER}`);

  const transporter = createTransporter();

  // Verify connection first
  await new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP Verify failed:', error.message);
        reject(error);
      } else {
        console.log('✅ SMTP Connection verified!');
        resolve(success);
      }
    });
  });

  const mailOptions = {
    from: '"ExpenseIQ Pro" <obadah964@gmail.com>',
    to: email,
    subject: 'Verify Your ExpenseIQ Pro Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #020617; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; color: white; }
          .body { padding: 30px; }
          .otp-box { background: #1e293b; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp { font-size: 42px; font-weight: bold; color: #6366f1; letter-spacing: 10px; font-family: monospace; }
          .footer { padding: 20px; background: #020617; text-align: center; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>💎 ExpenseIQ Pro</h1></div>
          <div class="body">
            <h2 style="color:#e2e8f0;">Hello, ${name}! 👋</h2>
            <p style="color:#94a3b8;">Your verification code is:</p>
            <div class="otp-box">
              <div class="otp">${otp}</div>
              <p style="color:#64748b;margin:8px 0 0;font-size:12px;">Expires in 10 minutes</p>
            </div>
            <p style="color:#94a3b8;font-size:14px;">If you didn't create an account, ignore this email.</p>
          </div>
          <div class="footer">© 2026 ExpenseIQ Pro by Obadah Furquan</div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${name}, Your ExpenseIQ Pro OTP is: ${otp}. Expires in 10 minutes.`
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ OTP email sent successfully! Message ID: ${info.messageId}`);
  return info;
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: '"ExpenseIQ Pro" <obadah964@gmail.com>',
      to: email,
      subject: 'Welcome to ExpenseIQ Pro! 🎉',
      text: `Welcome ${name}! Your account is verified. Start tracking your expenses at ${process.env.CLIENT_URL}`
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (e) {
    console.error('Welcome email failed:', e.message);
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail };