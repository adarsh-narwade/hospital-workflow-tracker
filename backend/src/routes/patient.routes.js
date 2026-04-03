const express = require("express");
const router = express.Router();

const {
  getAll,
  getOne,
  create,
  update,
  discharge,
} = require("../controllers/patient.controller");

const { protect, authorize } = require("../middleware/auth");

// All patient routes require a valid JWT token
// protect runs before every route handler below
router.use(protect);

router.get("/", getAll);         // GET  /api/patients
router.get("/:id", getOne);      // GET  /api/patients/:id
router.post("/", authorize("admin", "doctor"), create);        // POST /api/patients
router.patch("/:id", authorize("admin", "doctor"), update);    // PATCH /api/patients/:id
router.patch("/:id/discharge", authorize("admin", "doctor"), discharge); // PATCH /api/patients/:id/discharge

module.exports = router;
