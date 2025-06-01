const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Thêm log để kiểm tra
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_PASS:', process.env.GMAIL_PASS);

const sendEmail = async (to, subject, text) => {
  try {
    console.log(`Sending email to ${to} with subject: ${subject}`);
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