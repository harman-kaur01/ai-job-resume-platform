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
// AI Job Recommendations
// ======================================

router.get(
  "/",
  protect,
  async (req, res) => {
    try {
      const resume = await Resume.findOne({
        userId: req.user.userId
      }).sort({
        createdAt: -1
      });

      if (!resume) {
        return res.status(404).json({
          message:
            "No resume found. Please upload a resume first."
        });
      }

      if (!resume.extractedText) {
        return res.status(400).json({
          message:
            "Resume text is empty."
        });
      }

      const jobs = await Job.find({
        status: "active"
      });

      if (jobs.length === 0) {
        return res.status(404).json({
          message:
            "No active jobs available."
        });
      }

      const jobData = jobs.map((job) => ({
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        skills: job.skills,
        experience: job.experience,
        jobType: job.jobType,
        description: job.description
      }));

      const prompt = `
You are an AI job recommendation system.

Analyze the candidate's resume and recommend the
most suitable jobs from the provided job list.

CANDIDATE RESUME:
${resume.extractedText}

AVAILABLE JOBS:
${JSON.stringify(jobData)}

Return ONLY valid JSON in this exact format:

{
  "recommendations": [
    {
      "jobId": "",
      "matchScore": 0,
      "reason": ""
    }
  ]
}

Rules:
- Return maximum 5 recommendations.
- matchScore must be between 0 and 100.
- Recommend jobs that genuinely match the resume.
- Higher score means better match.
- reason must be short and practical.
- Sort recommendations from highest matchScore to lowest.
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
        result =
          JSON.parse(resultText);
      } catch (error) {
        return res.status(500).json({
          message:
            "AI returned an invalid response",
          rawResponse:
            resultText
        });
      }

      const recommendations =
        result.recommendations || [];

      const finalRecommendations =
        recommendations
          .map((recommendation) => {
            const job = jobs.find(
              (item) =>
                item._id.toString() ===
                recommendation.jobId
            );

            if (!job) {
              return null;
            }

            return {
              job,
              matchScore:
                recommendation.matchScore,
              reason:
                recommendation.reason
            };
          })
          .filter(Boolean);

      res.status(200).json({
        resume: {
          id: resume._id,
          fileName: resume.fileName
        },
        recommendations:
          finalRecommendations
      });

    } catch (error) {
      console.error(
        "AI recommendation error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to generate job recommendations",
        error:
          error.message
      });
    }
  }
);

module.exports = router;