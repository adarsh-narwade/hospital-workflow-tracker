const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/auth.controller");
const { protect, optionalProtect } = require("../middleware/auth");

// Public routes — no token needed
router.post("/register", optionalProtect, register);
router.post("/login", login);

// Protected route — token required
// protect runs first, then getMe
router.get("/me", protect, getMe);

module.exports = router;
