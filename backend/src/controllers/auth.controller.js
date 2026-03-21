const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper function — creates a signed JWT token containing the user's id
// We call this after both register and login
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },             // Payload — what's stored inside the token
    process.env.JWT_SECRET,     // Secret key — only your server knows this
    { expiresIn: process.env.JWT_EXPIRES_IN } // e.g. "7d"
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if this email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Create the user — the pre-save hook in User.js hashes the password
    const user = await User.create({ name, email, password, role, department });

    // Generate a token so the user is logged in immediately after registering
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user, // password is removed by toJSON() in the User model
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // If no user found OR password doesn't match — same error message
    // We don't say which one failed — that would reveal who has accounts
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Logged in successfully",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me  — protected route, returns the logged-in user's profile
exports.getMe = async (req, res) => {
  try {
    // req.user was attached by the protect middleware
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};