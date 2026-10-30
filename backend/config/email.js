const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000
});

const sendEmail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: `"DALALX" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
};

module.exports = sendEmail;