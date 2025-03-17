const mongoose = require("mongoose");

const HealthDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  steps: { type: Number, required: true },
  heartRate: { type: Number, required: true },
  date: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model("HealthData", HealthDataSchema);
