const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // e.g. "Give medication", "Run blood test"
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["medication", "lab_order", "procedure", "general", "emergency"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    // Which staff member is responsible for this task
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Which patient this task is for
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    dueAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null, // Set automatically when status changes to "completed"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);