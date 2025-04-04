const nodemailer = require("nodemailer");

const sendResetPasswordEmail = async (recipientEmail, resetLink) => {
  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.mailersend.net", // MailSend SMTP server
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILERSEND_USER, // MailSend user
        pass: process.env.MAILERSEND_PASS, // MailSend password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: "Password Reset",
      text: `Please click on the following link to reset your password: ${resetLink}`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.response);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, message: "Failed to send email." };
  }
};

module.exports = sendResetPasswordEmail;
