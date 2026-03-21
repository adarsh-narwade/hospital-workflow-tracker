const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    ward: {
      type: String,
      required: true, // e.g. "Cardiology", "ICU", "General"
    },
    // ObjectId ref means this field stores a reference (like a foreign key)
    // to a document in the "beds" collection
    // When we query, we can "populate" this to get the full bed document
    bedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
      default: null, // null means no bed assigned yet
    },
    admittedAt: {
      type: Date,
      default: Date.now, // Automatically set to right now when admitted
    },
    dischargedAt: {
      type: Date,
      default: null, // null means still admitted
    },
    status: {
      type: String,
      enum: ["admitted", "discharged", "transferred", "critical"],
      default: "admitted",
    },
    diagnosis: {
      type: String,
      default: "",
    },
    // Reference to the doctor (User) assigned to this patient
    attendingDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);