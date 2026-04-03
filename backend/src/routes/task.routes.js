const express = require("express");
const router = express.Router();

const { getAll, getOne, create, update, remove } = require("../controllers/task.controller");
const { protect, authorize } = require("../middleware/auth");

// All task routes require a valid token
router.use(protect);

router.get("/", getAll);          // GET    /api/tasks
router.get("/:id", getOne);       // GET    /api/tasks/:id
router.post("/", authorize("admin", "doctor", "nurse"), create);         // POST   /api/tasks
router.patch("/:id", authorize("admin", "doctor", "nurse"), update);     // PATCH  /api/tasks/:id
router.delete("/:id", authorize("admin", "doctor"), remove);    // DELETE /api/tasks/:id

module.exports = router;
