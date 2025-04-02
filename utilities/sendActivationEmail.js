const nodemailer = require("nodemailer");

const sendActivationEmail = async (email, activationLink) => {
  // Configure the transporter with your email service
  const transporter = nodemailer.createTransport({
    service: "MailerSend", // Use your email provider (e.g., Gmail, Outlook, etc.)
    auth: {
      user: process.env.EMAIL_USER, // Email address from your .env file
      pass: process.env.EMAIL_PASS, // Password or app-specific password
    },
  });

  // Email details
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: email, // Recipient address
    subject: "Activate Your Account",
    text: `Welcome! Please click the following link to activate your account: ${activationLink}`,
    html: `<p>Welcome! Please click the following link to activate your account:</p><a href="${activationLink}">Activate Account</a>`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Activation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending activation email:", error);
    throw new Error("Failed to send activation email.");
  }
};

module.exports = sendActivationEmail;
