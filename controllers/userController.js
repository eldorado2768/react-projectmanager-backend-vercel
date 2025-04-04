const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendActivationEmail = require("../utilities/sendActivationEmail");
const Role = require("../models/Role");
const crypto = require("crypto");

/*Registers a new user*/
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, roleId } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !roleId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Generate activation code and expiration
    const accessCode = crypto.randomBytes(16).toString("hex");
    const accessCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Current time + 24 hours

    //add forgot password reset token with null values
    const resetPasswordToken = null;
    const resetPasswordExpires = null;

    //add password with null value
    const password = null;

    // Validate the roleId
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: "Invalid role ID." });
    }

    // Create the new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      username: email, // Username = email
      password,
      roleId: role._id, // Link role to the user
      accessCode,
      accessCodeExpires,
      resetPasswordToken,
      resetPasswordExpires,
      isActivated: false, // New user is not activated
    });

    //Save the new user record in the database
    await newUser.save();

    // Send activation email
    await sendActivationEmail(email, accessCode);

    res.status(201).json({
      message: `User registered successfully. Activation email sent to ${email}.`,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "An error occurred while registering the user." });
  }
};

/*Activate a new user*/
const activateUser = async (req, res) => {
  const { email, accessCode } = req.body;

  try {
    const user = await User.findOne({ email, accessCode });

    if (!user) {
      return res.status(400).json({ message: "Invalid activation link." });
    }

    if (user.isActivated) {
      return res.status(400).json({ message: "Account is already activated." });
    }

    user.isActivated = true; // Activate the user
    user.accessCode = null; // Clear the access code
    user.accessCodeExpires = null; // Clear the expiration date
    await user.save();

    res.status(200).json({ message: "Account activated successfully." });
  } catch (error) {
    console.error("Error activating user:", error);
    res
      .status(500)
      .json({ message: "An error occurred while activating the user." });
  }
};

/*Set password for a new activated user*/
const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password created successfully." });
  } catch (error) {
    console.error("Error setting password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { setPassword };

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

    const passwordMatch = bcrypt.compareSync(
      receivedPassword,
      databasePassword
    );

    
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
    const { email } = req.body;

    const user = await User.findOne({
      $or: [{ email: email }],
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
    const resetExpires = Date.now() + 10 * 600 * 1000; //updated from 60 to 600

    console.log("Generated token:", resetToken); // Log the token immediately after generation
    console.log("Generated date:", resetExpires); // Log the token immediately after generation
    console.log("User object before save:", user); // Log the user object before save

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;

    // Retrieve user.email before user.save()
    const userEmail = user.email;
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
      to: userEmail,
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

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log("Received token:", token);

    // Find the user by token and ensure it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure the token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Validate the new password
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.",
      });
    }

    // Hash and update the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;
    user.lastUpdated = Date.now();

    // Clear reset token and expiration
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    try {
      await user.save();
    } catch (error) {
      console.error("Error saving user:", error);
    }

    console.log("User updated successfully:", user.email);
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  setPassword,
  loginUser,
  forgotPassword,
  resetPassword,
  activateUser,
};
