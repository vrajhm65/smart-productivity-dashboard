const FocusSession = require("../models/focusSession");
const Timer = require("../models/timer");

const getFocusSessions = async (req, res) => {
  try {
    const sessions = await FocusSession.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.json(
      sessions.map((session) => ({
        id: session._id.toString(),
        duration: session.duration,
        completed: session.completed,
        createdAt: session.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching focus sessions:", error);
    res.status(500).json({
      message: "Failed to fetch focus sessions",
    });
  }
};

const createFocusSession = async (req, res) => {
  try {
    const { duration } = req.body;

    if (duration === undefined || duration <= 0) {
      return res.status(400).json({
        message: "Valid duration is required",
      });
    }

    const session = await FocusSession.create({
      duration,
      completed: false,
      user: req.userId,
    });

    res.status(201).json({
      message: "Focus session added successfully",
      session: {
        id: session._id.toString(),
        duration: session.duration,
        completed: session.completed,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating focus session:", error);
    res.status(500).json({
      message: "Failed to create focus session",
    });
  }
};

const getTimer = async (req, res) => {
  try {
    let timer = await Timer.findOne({
      user: req.userId,
    });

    if (!timer) {
      timer = await Timer.create({
        seconds: 0,
        running: false,
        user: req.userId,
      });
    }

    res.json({
      id: timer._id.toString(),
      seconds: timer.seconds,
      running: timer.running,
    });
  } catch (error) {
    console.error("Error fetching timer:", error);
    res.status(500).json({
      message: "Failed to fetch timer",
    });
  }
};

const updateTimer = async (req, res) => {
  try {
    let timer = await Timer.findOne({
      user: req.userId,
    });

    if (!timer) {
      timer = new Timer({
        user: req.userId,
      });
    }

    if (req.body.seconds !== undefined) {
      timer.seconds = req.body.seconds;
    }

    if (req.body.running !== undefined) {
      timer.running = req.body.running;
    }

    await timer.save();

    res.json({
      message: "Timer updated successfully",
      timer: {
        id: timer._id.toString(),
        seconds: timer.seconds,
        running: timer.running,
      },
    });
  } catch (error) {
    console.error("Error updating timer:", error);
    res.status(500).json({
      message: "Failed to update timer",
    });
  }
};

module.exports = {
  getFocusSessions,
  createFocusSession,
  getTimer,
  updateTimer,
};