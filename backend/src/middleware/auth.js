const jwt = require("jsonwebtoken");
const User = require("../models/User");

// "protect" is a middleware function — it runs BEFORE the route handler
// If the token is invalid, it stops here and returns 401
// If valid, it attaches the user to req and calls next()
const protect = async (req, res, next) => {
  // Tokens arrive in the Authorization header like this:
  // "Bearer eyJhbGciOiJIUzI1NiJ9...."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  // Split "Bearer <token>" → take only the token part
  const token = authHeader.split(" ")[1];

  try {
    // jwt.verify() checks the signature AND expiry
    // If anything is wrong it throws an error — caught below
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from DB using the id stored inside the token
    // .select("-password") means return everything EXCEPT the password
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    next(); // Token is valid — pass control to the route handler
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
  } catch (err) {
    req.user = null;
  }

  next();
};

// authorize checks the user's ROLE after protect has run
// Usage: router.delete("/users/:id", protect, authorize("admin"), handler)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not allowed to do this`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalProtect, authorize };
