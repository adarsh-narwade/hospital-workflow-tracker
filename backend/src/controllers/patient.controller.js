const Patient = require("../models/Patient");
const Bed = require("../models/Bed");

// GET /api/patients
// Returns all patients — can filter by ward or status via query params
// Example: /api/patients?ward=ICU&status=admitted
exports.getAll = async (req, res) => {
  try {
    const { ward, status } = req.query;

    // Build filter object dynamically
    // If ward is provided add it, if not — don't filter by ward
    const filter = {};
    if (ward) filter.ward = ward;
    if (status) filter.status = status;

    const patients = await Patient.find(filter)
      // populate() replaces the bedId ObjectId with the actual bed document
      // We only fetch bedNumber and room — not the entire bed document
      .populate("bedId", "bedNumber room")
      // Same for attendingDoctor — only fetch name and role
      .populate("attendingDoctor", "name role")
      .sort({ createdAt: -1 }); // Newest first

    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/patients/:id
// Returns a single patient by their MongoDB _id
exports.getOne = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate("bedId")
      .populate("attendingDoctor", "name role");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/patients
// Admits a new patient
exports.create = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);

    // If a bed was assigned during admission, mark that bed as occupied
    if (patient.bedId) {
      await Bed.findByIdAndUpdate(patient.bedId, {
        status: "occupied",
        currentPatient: patient._id,
      });
    }

    res.status(201).json({
      message: "Patient admitted successfully",
      patient,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/patients/:id
// Updates any patient fields (ward, diagnosis, notes, etc.)
exports.update = async (req, res) => {
  try {
    // new: true — returns the updated document, not the old one
    // runValidators: true — checks enum values and required fields on update
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      message: "Patient updated successfully",
      patient,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/patients/:id/discharge
// Discharges a patient and frees their bed
exports.discharge = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (patient.status === "discharged") {
      return res.status(400).json({ message: "Patient already discharged" });
    }

    // Update the patient's status and set discharge time
    patient.status = "discharged";
    patient.dischargedAt = new Date();
    await patient.save();

    // Free the bed — mark it as cleaning, remove the patient reference
    if (patient.bedId) {
      await Bed.findByIdAndUpdate(patient.bedId, {
        status: "cleaning",
        currentPatient: null,
      });
    }

    res.json({
      message: "Patient discharged successfully",
      patient,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};