const express = require("express");

const Resume = require("../models/Resume");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const { analyzeResumeWithAI } = require("../services/aiService");

const router = express.Router();

router.post(
  "/:resumeId",
  protect,
  authorizeRoles("job-seeker"),
  async (req, res) => {
    try {
      // ======================================
      // Find Resume
      // ======================================

      const resume = await Resume.findById(
        req.params.resumeId
      );

      if (!resume) {
        return res.status(404).json({
          message: "Resume not found"
        });
      }

      // ======================================
      // Check Ownership
      // ======================================

      if (
        resume.userId.toString() !==
        req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only analyze your own resume"
        });
      }

      // ======================================
      // Check Extracted Text
      // ======================================

      if (!resume.extractedText) {
        return res.status(400).json({
          message:
            "No text found in this resume"
        });
      }

      // ======================================
      // Send Resume to OpenAI
      // ======================================

      console.log(
        "Sending resume to OpenAI..."
      );

      const aiResult =
        await analyzeResumeWithAI({
          resumeText:
            resume.extractedText,

          skills:
            resume.skills || []
        });

      console.log(
        "AI resume analysis completed."
      );

      // ======================================
      // Save AI Results
      // ======================================

      resume.aiScore =
        aiResult.score;

      resume.aiFeedback =
        JSON.stringify(aiResult);

      await resume.save();

      // ======================================
      // Response
      // ======================================

      res.status(200).json({
        message:
          "Resume analyzed successfully",

        resumeId:
          resume._id,

        analysis:
          aiResult
      });

    } catch (error) {
      console.error(
        "AI Resume Analysis Error:",
        error
      );

      res.status(500).json({
        message:
          "AI resume analysis failed",

        error:
          error.message
      });
    }
  }
);

module.exports = router;