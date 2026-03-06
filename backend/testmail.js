process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nodemailer = require('nodemailer');

async function main() {
  const testAccount = await nodemailer.createTestAccount();
  console.log('Test account:', testAccount.user);

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  const info = await transporter.sendMail({
    from: testAccount.user,
    to: 'obadah964@gmail.com',
    subject: 'Test OTP from ExpenseIQ',
    text: 'Your OTP is 123456'
  });

  console.log('✅ Message sent!');
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
}

main().catch(e => console.log('❌ Error:', e.message));