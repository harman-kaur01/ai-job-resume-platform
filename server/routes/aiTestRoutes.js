const express = require("express");
const { analyzeResumeWithAI } = require("../services/aiService");

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    const result = await analyzeResumeWithAI({
      resumeText:
        "BCA graduate skilled in Python, Flask, Django, MySQL and JavaScript. Developed a Hostel Management System using Python, Flask and MySQL.",
      skills: [
        "Python",
        "Flask",
        "Django",
        "MySQL",
        "JavaScript"
      ]
    });

    res.status(200).json({
      message: "OpenAI connection successful",
      result
    });

  } catch (error) {
    console.error("AI test error:", error);

    res.status(500).json({
      message: "OpenAI connection failed",
      error: error.message
    });
  }
});

module.exports = router;