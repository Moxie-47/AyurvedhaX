const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Get all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("_id name email");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
