const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getFocusSessions,
  createFocusSession,
  getTimer,
  updateTimer,
} = require("../controllers/focusController");

router.use(protect);

router.get("/", getFocusSessions);
router.post("/", createFocusSession);

router.get("/timer", getTimer);
router.put("/timer", updateTimer);

module.exports = router;