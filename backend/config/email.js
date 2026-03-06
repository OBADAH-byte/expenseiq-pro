process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 2525,
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

module.exports = createTransporter;