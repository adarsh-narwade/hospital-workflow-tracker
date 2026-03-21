const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: true,
      unique: true, // e.g. "A101", "B204" — must be unique across the hospital
    },
    room: {
      type: String,
      required: true, // e.g. "101", "204"
    },
    floor: {
      type: Number,
      required: true, // e.g. 1, 2, 3
    },
    ward: {
      type: String,
      required: true, // e.g. "Cardiology", "ICU"
    },
    status: {
      type: String,
      enum: ["available", "occupied", "cleaning", "maintenance"],
      default: "available",
    },
    // Which patient is currently in this bed
    // null means the bed is empty
    currentPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bed", bedSchema);