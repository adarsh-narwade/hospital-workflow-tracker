const Bed = require("../models/Bed");

// GET /api/beds
// Returns all beds — can filter by ward or status
// Example: /api/beds?status=available&ward=ICU
exports.getAll = async (req, res) => {
  try {
    const { ward, status } = req.query;

    const filter = {};
    if (ward) filter.ward = ward;
    if (status) filter.status = status;

    const beds = await Bed.find(filter)
      // populate currentPatient — only fetch name and status
      // We don't need the full patient document, just enough to show who's in the bed
      .populate("currentPatient", "name status")
      .sort({ ward: 1, bedNumber: 1 }); // Sort by ward first, then bed number

    res.json(beds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/beds/stats
// Returns a count of beds grouped by status
// Useful for the dashboard — "12 available, 8 occupied, 2 cleaning"
exports.getStats = async (req, res) => {
  try {
    // aggregate() lets us run MongoDB pipeline operations
    // $group groups all documents by their status field and counts them
    const stats = await Bed.aggregate([
      {
        $group: {
          _id: "$status",       // group by the status field
          count: { $sum: 1 },   // count each group
        },
      },
    ]);

    // stats looks like:
    // [{ _id: "available", count: 12 }, { _id: "occupied", count: 8 }]
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/beds/:id
exports.getOne = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id)
      .populate("currentPatient", "name status ward diagnosis");

    if (!bed) {
      return res.status(404).json({ message: "Bed not found" });
    }

    res.json(bed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/beds
// Creates a new bed — only admins should do this
exports.create = async (req, res) => {
  try {
    const bed = await Bed.create(req.body);
    res.status(201).json({
      message: "Bed created successfully",
      bed,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/beds/:id
// Updates bed status — e.g. "cleaning" → "available" after housekeeping
exports.update = async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bed) {
      return res.status(404).json({ message: "Bed not found" });
    }

    res.json({
      message: "Bed updated successfully",
      bed,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};