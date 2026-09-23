const Plan = require("../models/Plan");

const formatPlan = (plan) => ({
  id: plan._id.toString(),
  time: plan.time,
  title: plan.title,
  date: plan.date || null,
  completed: plan.completed,
  completedAt: plan.completedAt || null,
  createdAt: plan.createdAt,
});

const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({
      user: req.userId,
    }).sort({
      date: 1,
      time: 1,
      createdAt: 1,
    });

    res.json(plans.map(formatPlan));
  } catch (error) {
    console.error("Error fetching plans:", error);

    res.status(500).json({
      message: "Failed to fetch plans",
    });
  }
};

const createPlan = async (req, res) => {
  try {
    const { time, title, date } = req.body;

    if (!time || !title) {
      return res.status(400).json({
        message: "Time and title are required",
      });
    }

    const plan = await Plan.create({
      time,
      title: title.trim(),
      date: date || null,
      completed: false,
      completedAt: null,
      user: req.userId,
    });

    res.status(201).json({
      message: "Plan created successfully",
      plan: formatPlan(plan),
    });
  } catch (error) {
    console.error("Error creating plan:", error);

    res.status(500).json({
      message: "Failed to create plan",
    });
  }
};

const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    if (req.body.time !== undefined) {
      plan.time = req.body.time;
    }

    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res.status(400).json({
          message: "Plan title cannot be empty",
        });
      }

      plan.title = req.body.title.trim();
    }

    if (req.body.date !== undefined) {
      plan.date = req.body.date || null;
    }

    if (req.body.completed !== undefined) {
      const isCompleting = req.body.completed === true;

      plan.completed = isCompleting;

      if (isCompleting) {
        plan.completedAt = plan.completedAt || new Date();
      } else {
        plan.completedAt = null;
      }
    }

    await plan.save();

    res.json({
      message: "Plan updated successfully",
      plan: formatPlan(plan),
    });
  } catch (error) {
    console.error("Error updating plan:", error);

    res.status(500).json({
      message: "Failed to update plan",
    });
  }
};

const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    res.json({
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);

    res.status(500).json({
      message: "Failed to delete plan",
    });
  }
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
};