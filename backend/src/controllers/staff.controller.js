const User = require("../models/User");
const Shift = require("../models/Shift");

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// GET /api/staff
exports.getAllStaff = async (req, res) => {
  try {
    const { role, department } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;

    const staff = await User.find(filter)
      .select("-password")
      .sort({ role: 1, name: 1 });

    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/staff/shifts
exports.getShifts = async (req, res) => {
  try {
    const { from, to, staff, ward } = req.query;

    const filter = {};
    if (staff) filter.staff = staff;
    if (ward) filter.ward = ward;
    if (from || to) {
      filter.startTime = {};
      if (from) filter.startTime.$gte = new Date(from);
      if (to) filter.startTime.$lte = new Date(to);
    }

    const shifts = await Shift.find(filter)
      .populate("staff", "name role department")
      .sort({ startTime: 1 });

    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/staff/shifts
exports.createShift = async (req, res) => {
  try {
    const { staff, ward, shiftType, startTime, endTime, notes } = req.body;

    const staffMember = await User.findById(staff).select("_id");
    if (!staffMember) {
      throw createError(404, "Staff member not found");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw createError(400, "Shift start and end time must be valid dates");
    }

    if (end <= start) {
      throw createError(400, "Shift end time must be after start time");
    }

    const shift = await Shift.create({
      staff,
      ward,
      shiftType,
      startTime: start,
      endTime: end,
      notes,
      createdBy: req.user?._id || null,
    });

    await shift.populate("staff", "name role department");

    res.status(201).json({
      message: "Shift scheduled successfully",
      shift,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// DELETE /api/staff/shifts/:id
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    res.json({ message: "Shift deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
