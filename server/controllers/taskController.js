const Task = require("../models/task");

const formatTask = (task) => ({
  id: task._id.toString(),
  title: task.title,
  dueDate: task.dueDate || null,
  completed: task.completed,
  completedAt: task.completedAt || null,
  createdAt: task.createdAt,
});

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.userId,
    }).sort({
      dueDate: 1,
      createdAt: -1,
    });

    res.json(tasks.map(formatTask));
  } catch (error) {
    console.error("Error fetching tasks:", error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(formatTask(task));
  } catch (error) {
    console.error("Error fetching task:", error);

    res.status(500).json({
      message: "Failed to fetch task",
    });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      dueDate: dueDate || null,
      completed: false,
      completedAt: null,
      user: req.userId,
    });

    res.status(201).json({
      message: "Task created successfully",
      task: formatTask(task),
    });
  } catch (error) {
    console.error("Error creating task:", error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty",
        });
      }

      task.title = req.body.title.trim();
    }

    if (req.body.dueDate !== undefined) {
      task.dueDate = req.body.dueDate || null;
    }

    if (req.body.completed !== undefined) {
      const isCompleting = req.body.completed === true;

      task.completed = isCompleting;

      if (isCompleting) {
        task.completedAt = task.completedAt || new Date();
      } else {
        task.completedAt = null;
      }
    }

    await task.save();

    res.json({
      message: "Task updated successfully",
      task: formatTask(task),
    });
  } catch (error) {
    console.error("Error updating task:", error);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};