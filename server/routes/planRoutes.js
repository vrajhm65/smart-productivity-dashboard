const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/planController");

router.use(protect);

router.get("/", getPlans);
router.post("/", createPlan);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);

module.exports = router;