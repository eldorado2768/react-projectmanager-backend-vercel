import User from "../models/User.js";
import Session from "../models/Session.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendActivationEmail from "../utilities/sendActivationEmail.js";
import sendResetPasswordEmail from "../utilities/sendResetPasswordEmail.js";
import Role from "../models/Role.js";
import crypto from "crypto";

/*Registers a new user*/
export const registerUser = async (req, res) => {
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
export const activateUser = async (req, res) => {
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
export const setPassword = async (req, res) => {
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

    const userId = user.user._Id;
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

// ✅ Helper Function: Create Session and Generate Tokens used in loginUser
const createSession = async (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Token expires in 1 hour
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // Token expires in 7 days
  );

  const session = new Session({
    userId,
    accessToken,
    refreshToken,
    expiresAt: new Date(Date.now() + 3600 * 1000), // Expiration 1 hour
  });

  await session.save(); // Save session in the database
  return { accessToken, refreshToken };
};

// ✅ Main Function: Login User
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Role-based redirects
  const roleRedirects = {
    superadmin: "/superadmin",
    admin: "/admin",
    user: "/index",
  };

  try {
    // Step 1: Validate User Credentials
    const user = await User.findOne({ username }).populate("roleId").lean();
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.roleId || !user.roleId.roleName) {
      return res.status(500).json({ message: "User role is not properly defined." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Step 2: Enforce Single Active Session
    await Session.deleteMany({ userId: user._id }); // Remove previous sessions

    // Step 3: Create New Session
    const { accessToken, refreshToken } = await createSession(user._id, user.roleId.roleName);

    // Step 4: Store Token in Cookie
    res.cookie("authToken", accessToken, {
      httpOnly: true, // Secure the cookie from JavaScript access
      secure: process.env.NODE_ENV === "production", // Only over HTTPS in production
      sameSite: "strict", // CSRF protection
      maxAge: 3600 * 1000, // 1-hour expiration
    });

    // Step 5: Return Response to Frontend
    return res.status(200).json({
      redirectUrl: roleRedirects[user.roleId.roleName] || "/login",
      userId: user._id,
      roleName: user.roleId.roleName,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//user requests a new token
export const refreshToken = async (req, res) => {
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

export const logoutUser = async (req, res) => {
  try {
    const receivedSessionId = req.headers["x-session-id"]; // Retrieve session ID from headers

    // Validate session ID exists
    if (!receivedSessionId) {
      return res.status(400).json({ message: "Session Id is missing" });
    }

    // Locate the session in the database
    const session = await Session.findOne({
      sessionId: receivedSessionId,
    }).lean();
    if (!session) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // Delete the session from the database
    await Session.deleteOne({ sessionId: receivedSessionId });

    // Respond to the client
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in logoutUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/*User forgets password*/
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      $or: [{ email: email }],
    });

    if (!user) {
      res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetExpires = Date.now() + 10 * 600 * 1000; //updated from 60 to 600

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;

    const userEmail = user.email;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send reset password email using the utility
    const emailResult = await sendResetPasswordEmail(userEmail, resetLink);

    if (emailResult.success) {
      res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
      res.setHeader("Content-Type", "application/json");
      return res.json({ message: "Reset email sent successfully." });
    } else {
      res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ message: emailResult.message });
    }
  } catch (error) {
    console.error(error);
    res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ message: "Internal server error" });
  }
};

/*is password valid*/
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
  return passwordRegex.test(password) && password.length >= 8;
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

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

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(req.userId)
      .populate("roleId", "roleName") // ✅ Populate roleId with roleName from Role collection
      .select("username firstName lastName email roleId"); // ✅ Ensure roleId is included

    if (!user) {
      return res.status(404).json({ error: "User not found." }); // ✅ Proper error handling
    }

    res.status(200).json({
      userId: userId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roleName: user.roleId.roleName,
      roleId: user.roleId._id,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to retrieve user profile." }); // ✅ Ensure JSON response
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  const userId = req.body.userId;
``
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    user.username = req.body.username || user.username;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
