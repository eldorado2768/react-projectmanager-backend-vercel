const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendActivationEmail = require("../utilities/sendActivationEmail");
const sendResetPasswordEmail = require("../utilities/sendResetPasswordEmail");
const Role = require("../models/Role");
const crypto = require("crypto");
const redis = require("redis");
const redisClient = redis.createClient(); // Adjust configuration if needed

const frontendURL =
  "https://react-projectmanager-git-master-david-brotmans-projects.vercel.app";

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

    const user = await User.findOne({ username: receivedUsername }).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const databasePassword = user.password.trim();

    const passwordMatch = bcrypt.compareSync(
      receivedPassword,
      databasePassword
    );

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET, // Use a separate secret for refresh tokens
      { expiresIn: "7d" } // Example: valid for 7 days
    );

    // Generate sessionID
    const sessionID = crypto.randomBytes(20).toString("hex");
    const sessionData = {
      token: accessToken,
      lastActivity: Date.now(),
    };

    // Store session info in Redis
    await redisClient.set(sessionID, JSON.stringify(sessionData));

    // Send response with both access and refresh tokens
    res.status(200).json({
      sessionID, // Send session ID to client
      accessToken,
      refreshToken, // Include refresh token
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//user requests a new token
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    // Verify refresh token
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//user logouts of system
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Optionally remove the refresh token from the database
    await RefreshTokenModel.deleteOne({ token: refreshToken });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in logoutUser:", error);
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
      res.setHeader("Access-Control-Allow-Origin", frontendURL);
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetExpires = Date.now() + 10 * 600 * 1000; //updated from 60 to 600

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;

    const userEmail = user.email;
    await user.save();

    const resetLink = `https://react-projectmanager-git-master-david-brotmans-projects.vercel.app/reset-password/${resetToken}`;

    // Send reset password email using the utility
    const emailResult = await sendResetPasswordEmail(userEmail, resetLink);

    if (emailResult.success) {
      res.setHeader("Access-Control-Allow-Origin", frontendURL);
      res.setHeader("Content-Type", "application/json");
      return res.json({ message: "Reset email sent successfully." });
    } else {
      res.setHeader("Access-Control-Allow-Origin", frontendURL);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ message: emailResult.message });
    }
  } catch (error) {
    console.error(error);
    res.setHeader("Access-Control-Allow-Origin", frontendURL);
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
