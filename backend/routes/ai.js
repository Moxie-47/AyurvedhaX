const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`;

router.post("/diagnose", async (req, res) => {
  try {
    const { steps, heartRate, moveMinutes, heartPoints } = req.body;

    if (!steps || !heartRate) {
      return res.status(400).json({ message: "Missing health data" });
    }

    console.log("🔹 Sending data to Gemini AI...");

    const aiPayload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `User Health Data:
              - Steps: ${steps}
              - Heart Rate: ${heartRate} BPM
              - Move Minutes: ${moveMinutes}
              - Heart Points: ${heartPoints}
    
              Provide a **VERY concise** health summary (3-4 key points). 
              - **Keep it under 50 words**.
              - Highlight only critical insights.
              - If data is missing or incorrect, **just mention it briefly**.
              - No disclaimers or excess details.`
            },
          ],
        },
      ],
      parameters: { temperature: 0.2, maxOutputTokens: 50 }, 
    };


    const response = await axios.post(ENDPOINT, aiPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("🔹 Gemini AI Response:", response.data);

    const diagnosis = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No diagnosis available";

    res.json({ diagnosis });
  } catch (error) {
    console.error(" Gemini AI Error:", error.response?.data || error.message);
    res.status(500).json({ message: "AI Diagnosis failed", error: error.message });
  }
});

module.exports = router;
