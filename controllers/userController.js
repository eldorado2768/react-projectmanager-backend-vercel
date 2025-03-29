const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

/*Registers a new user*/
const registerUser = async (req, res) => {
  try {
    const { username, password, permissionId, firstName, lastName, email } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      permissionId,
      firstName,
      lastName,
      email,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*Login an existing user*/
const loginUser = async (req, res) => {
  try {
    const receivedUsername = req.body.username.trim();
    const receivedPassword = req.body.password.trim();

    console.log("Received Username:", receivedUsername);
    console.log("Received Password:", receivedPassword);

    const user = await User.findOne({ username: receivedUsername });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const databaseUsername = user.username.trim();
    const databasePassword = user.password.trim();

    console.log("Database Username:", databaseUsername);
    console.log("Database Hashed Password:", databasePassword);

    const passwordMatch = bcrypt.compareSync(
      receivedPassword,
      databasePassword
    );
    console.log("Password Match:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET, // Use environment variable for secret
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*User forgets password*/
const forgotPassword = async (req, res) => {
  console.log("forgotPassword function called");
  try {
    const { emailOrUsername } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      res.setHeader(
        "Access-Control-Allow-Origin",
        "https://react-projectmanager-git-master-david-brotmans-projects.vercel.app"
      );
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetExpires = Date.now() + 10 * 60 * 1000;

    console.log("Generated token:", resetToken); // Log the token immediately after generation
    console.log("Generated date:", resetExpires); // Log the token immediately after generation
    console.log("User object before save:", user); // Log the user object before save

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    console.log("User object after save:", user); // Log the user object after save

    const resetLink = `https://react-projectmanager-git-master-david-brotmans-projects.vercel.app/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.mailersend.net", // MailSend SMTP server
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILERSEND_USER, //Mailsend user
        pass: process.env.MAILERSEND_PASS, //Mailsend password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      text: `Please click on the following link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        res.setHeader(
          "Access-Control-Allow-Origin",
          "https://react-projectmanager-git-master-david-brotmans-projects.vercel.app"
        );
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({ message: "Failed to send reset email." });
      } else {
        console.log("Email sent:", info.response);
        res.setHeader(
          "Access-Control-Allow-Origin",
          "https://react-projectmanager-git-master-david-brotmans-projects.vercel.app"
        );
        res.setHeader("Content-Type", "application/json");
        return res.json({ message: "Reset email sent successfully." });
      }
    });
  } catch (error) {
    console.error(error);
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://react-projectmanager-git-master-david-brotmans-projects.vercel.app"
    );
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ message: "Internal server error" });
  }
};

/*is password valid*/
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
  return passwordRegex.test(password) && password.length >= 8;
};

/*User resets password*/
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log("Received token:", token);

    // Find the user by reset token and expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    console.log("User found:", user);
    console.log("Date.now():", Date.now());

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Validate the password
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user in the database
    user.password = hashedPassword;
    user.lastUpdated = Date.now();
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    console.log("User updated:", user.email); // Add this line

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
