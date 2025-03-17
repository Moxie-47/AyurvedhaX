const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const mongoose = require("mongoose");
const auth = require('../middleware/auth'); // Ensure only logged-in users can access

// Book a new consultation
router.post('/book', auth, async (req, res) => {
    try {
        console.log("Request received:", req.body);
        console.log("Authenticated user:", req.user);

        const { doctor, date } = req.body;
        if (!doctor || !date) {
            return res.status(400).json({ message: "Doctor and date are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(doctor)) {
            return res.status(400).json({ message: "Invalid doctor ID format" });
        }

        const meetingLink = `https://meet.jit.si/${req.user.id}-${doctor.toString()}-${Date.now()}`;

        const consultation = new Consultation({
            patient: req.user.id,
            doctor: new mongoose.Types.ObjectId(doctor),
            date,
            meetingLink
        });

        await consultation.save();

        // ✅ Notify the doctor (Send meeting link via email or notification)
        const doctorUser = await User.findById(doctor);
        if (doctorUser) {
            console.log(`✅ Doctor Notified: ${doctorUser.email} - Meeting Link: ${meetingLink}`);
        }

        res.status(201).json({ message: "Consultation booked", consultation });
    } catch (err) {
        console.error("Server error:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Get user's consultations
router.get('/my-consultations', auth, async (req, res) => {
  try {
    const consultations = await Consultation.find({ patient: req.user.id }).populate('doctor', 'name email');
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get doctor’s scheduled consultations
router.get('/doctor-consultations', auth, async (req, res) => {
    try {
      const consultations = await Consultation.find({ doctor: req.user.id })
        .populate('patient', 'name email')
        .select("date meetingLink patient");
      res.json(consultations);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
  
module.exports = router;
