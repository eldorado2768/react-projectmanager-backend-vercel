import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts[0] === "Bearer") {
      req.token = parts[1];
    }

    if (!req.token) {
      return res
        .status(401)
        .json({ message: "Authentication token required." }); // Unauthorized
    } else {
      console.log("Token received in protect.js :", req.token);
    }
  }
  try {
    // Validate token using JWT
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data to the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Error validating token:", err);
    res.status(403).json({ message: "Invalid or expired token." }); // Forbidden
  }
};

export default protect;
