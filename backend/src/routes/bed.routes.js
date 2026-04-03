const express = require("express");
const router = express.Router();

const { getAll, getStats, getOne, create, update } = require("../controllers/bed.controller");
const { protect, authorize } = require("../middleware/auth");

// All bed routes require a valid token
router.use(protect);

router.get("/", getAll);          // GET  /api/beds
router.get("/stats", getStats);   // GET  /api/beds/stats
router.get("/:id", getOne);       // GET  /api/beds/:id

// Only admins can create beds — authorize checks the role
// protect runs first (checks token), then authorize (checks role)
router.post("/", authorize("admin"), create);  // POST /api/beds

router.patch("/:id", authorize("admin"), update);     // PATCH /api/beds/:id

module.exports = router;
