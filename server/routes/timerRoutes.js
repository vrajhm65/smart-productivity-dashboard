const express = require("express");
const router = express.Router();


router.get("/", getTimer);
router.put("/", updateTimer);

module.exports = router;
