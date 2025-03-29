const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.mailersend.net',
  port: 587,
  secure: false, // TLS/STARTTLS
  auth: {
    user: process.env.MAILERSEND_USER,
    pass: process.env.MAILERSEND_PASS,
  },
});

const mailOptions = {
    from: process.env.EMAIL_USER, // Your verified MailerSend email address
    to: 'david@123websitebiz.com', // Replace with a test email address
    subject: 'Test Email from Render',
    text: 'This is a test email sent from Render.com using nodemailer and MailerSend.',
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
