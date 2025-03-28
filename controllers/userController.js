const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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

const forgotPassword = async (req, res) => {
  console.log("forgotPassword function called"); // Add this line
  try {
    const { emailOrUsername } = req.body;

    // Find the user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update user in the database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send password reset email
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`; // Replace with your frontend domain
    const transporter = nodemailer.createTransport({
      service: "yahoo", // Or your email service
      auth: {
        user: process.env.EMAIL_User, // Your email
        pass: process.env.EMAIL_PASS, // Your password or app password
      },
      tls: {
        rejectUnauthorized: false, // Disable certificate verification
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      text: `Please click on the following link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent:", mailOptions.to); // Add this line

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
  return passwordRegex.test(password) && password.length >= 8;
};

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
