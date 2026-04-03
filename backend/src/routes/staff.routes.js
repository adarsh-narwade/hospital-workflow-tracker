const express = require("express");
const router = express.Router();

const {
  getAllStaff,
  getShifts,
  createShift,
  deleteShift,
} = require("../controllers/staff.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getAllStaff);
router.get("/shifts", getShifts);
router.post("/shifts", authorize("admin", "doctor"), createShift);
router.delete("/shifts/:id", authorize("admin", "doctor"), deleteShift);

module.exports = router;
