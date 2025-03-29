const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  secure: false, // TLS/STARTTLS
  auth: {
    user: process.env.MAILERSEND_USER,
    pass: process.env.MAILERSEND_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER, // Your verified MailerSend email address
  to: "david@123websitebiz.com", // Replace with a test email address
  subject: "Test Email from Render",
  text: "This is a test email sent from Render.com using nodemailer and MailerSend.",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});

// Add a simple web server to keep Render.com happy.
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Email test script running.\n");
});

const port = 10000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
