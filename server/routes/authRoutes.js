const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/authController");


// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);


// Protected account routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);


module.exports = router;