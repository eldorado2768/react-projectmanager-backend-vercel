import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Authentication token required." }); // Unauthorized
  }

  try {
    // Validate token using JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data to the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Error validating token:", err);
    res.status(403).json({ message: "Invalid or expired token." }); // Forbidden
  }
};

export default protect;
