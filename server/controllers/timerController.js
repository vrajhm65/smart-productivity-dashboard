const Timer = require("../models/timer");

const getTimer = async (req, res) => {
    try {
        let timer = await Timer.findOne();

        if (!timer) {
            timer = await Timer.create({
                seconds: 0,
                running: false
            });
        }

        res.json({
            id: timer._id.toString(),
            seconds: timer.seconds,
            running: timer.running
        });

    } catch (error) {
        console.error("Error fetching timer:", error);

        res.status(500).json({
            message: "Failed to fetch timer"
        });
    }
};

const updateTimer = async (req, res) => {
    try {
        let timer = await Timer.findOne();

        if (!timer) {
            timer = new Timer();
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
                running: timer.running
            }
        });

    } catch (error) {
        console.error("Error updating timer:", error);

        res.status(500).json({
            message: "Failed to update timer"
        });
    }
};

module.exports = {
    getTimer,
    updateTimer
};