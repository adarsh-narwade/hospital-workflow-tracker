const Task = require("../models/Task");

// GET /api/tasks
// Can filter by status, priority, or assignedTo
// Example: /api/tasks?status=pending&priority=urgent
exports.getAll = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name role")
      .populate("patient", "name ward")
      // Sort by priority severity first, then newest
      // urgent tasks float to the top automatically
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tasks/:id
exports.getOne = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name role")
      .populate("patient", "name ward");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tasks
// Creates a new clinical task or order
exports.create = async (req, res) => {
  try {
    const task = await Task.create(req.body);

    // Populate after creation so the response includes
    // full staff name and patient name — not just raw IDs
    await task.populate("assignedTo", "name role");
    await task.populate("patient", "name ward");

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/tasks/:id
// Updates task — most commonly used to change status
// e.g. pending → in_progress → completed
exports.update = async (req, res) => {
  try {
    // If someone is marking the task as completed,
    // automatically record the exact time it was completed
    if (req.body.status === "completed") {
      req.body.completedAt = new Date();
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "name role")
      .populate("patient", "name ward");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/tasks/:id
// Removes a task entirely — used for cancelled or mistaken entries
exports.remove = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};