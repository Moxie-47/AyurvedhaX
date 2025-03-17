const express = require("express");
const HealthData = require("../models/HealthData");
const auth = require("../middleware/auth");

const router = express.Router();


router.post("/save", auth, async (req, res) => {
  try {
    const { steps, heartRate } = req.body;
    const userId = req.user.id; 

    if (!steps || !heartRate) {
      return res.status(400).json({ msg: "Steps & Heart Rate are required" });
    }

    const healthData = new HealthData({ userId, steps, heartRate });
    await healthData.save();

    res.json({ msg: "Health Data Saved Successfully!", healthData });
  } catch (error) {
    console.error("Health Data Save Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});


router.get("/user-data", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const healthData = await HealthData.find({ userId }).sort({ date: -1 }); 
    res.json(healthData);
  } catch (error) {
    console.error("Fetch Health Data Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
