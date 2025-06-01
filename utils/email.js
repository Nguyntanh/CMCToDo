const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Email của bạn
    pass: process.env.GMAIL_PASS // Mật khẩu ứng dụng của Gmail
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"CMC To Do" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };