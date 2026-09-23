const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema(
  {
    seconds: {
      type: Number,
      default: 0,
    },

    running: {
      type: Boolean,
      default: false,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Timer", timerSchema);