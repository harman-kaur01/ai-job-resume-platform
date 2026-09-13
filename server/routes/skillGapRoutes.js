const express = require("express");
const OpenAI = require("openai");

const protect = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");
const Job = require("../models/Job");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ======================================
// AI Skill Gap Analysis
// ======================================

router.post(
  "/:jobId/:resumeId",
  protect,
  async (req, res) => {
    try {
      const { jobId, resumeId } = req.params;

      const job = await Job.findById(jobId);
      const resume = await Resume.findById(resumeId);

      if (!job) {
        return res.status(404).json({
          message: "Job not found"
        });
      }

      if (!resume) {
        return res.status(404).json({
          message: "Resume not found"
        });
      }

      const resumeText =
        resume.extractedText || "";

      if (!resumeText.trim()) {
        return res.status(400).json({
          message:
            "Resume text is empty. Please upload a readable resume."
        });
      }

      const jobSkills = Array.isArray(job.skills)
        ? job.skills.join(", ")
        : "";

      const prompt = `
You are an AI career advisor.

Analyze the candidate's resume against the
target job and identify their skill gaps.

TARGET JOB:
Title: ${job.title}
Company: ${job.company}
Required Skills: ${jobSkills}
Description: ${job.description}
Experience: ${job.experience}

CANDIDATE RESUME:
${resumeText}

Return ONLY valid JSON in this exact format:

{
  "existingSkills": [],
  "missingSkills": [],
  "prioritySkills": [],
  "learningPlan": [],
  "careerAdvice": ""
}

Rules:
- existingSkills: important skills the candidate already has.
- missingSkills: important skills required by the job that the candidate lacks.
- prioritySkills: maximum 5 skills the candidate should learn first.
- learningPlan: maximum 5 short practical learning steps.
- careerAdvice: short practical career advice.
`;

      const response =
        await openai.responses.create({
          model: "gpt-5.6-luna",
          input: prompt
        });

      const resultText =
        response.output_text;

      let result;

      try {
        result = JSON.parse(resultText);
      } catch (error) {
        return res.status(500).json({
          message:
            "AI returned an invalid response",
          rawResponse: resultText
        });
      }

      res.status(200).json({
        job: {
          id: job._id,
          title: job.title,
          company: job.company
        },

        resume: {
          id: resume._id,
          fileName: resume.fileName
        },

        skillGap: result
      });

    } catch (error) {
      console.error(
        "AI skill gap error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to analyze skill gap",
        error: error.message
      });
    }
  }
);

module.exports = router;