const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const protect = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");
const Job = require("../models/Job");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/:jobId/:resumeId", protect, async (req, res) => {
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

    const resumeText = resume.extractedText || "";

    if (!resumeText.trim()) {
      return res.status(400).json({
        message: "Resume text is empty. Please upload a readable resume."
      });
    }

    const jobSkills = Array.isArray(job.skills)
      ? job.skills.join(", ")
      : "";

    const prompt = `
You are an AI job matching system.

Compare the candidate's resume with the job requirements.

JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Required Skills: ${jobSkills}
Experience: ${job.experience}
Job Type: ${job.jobType}

RESUME:
${resumeText}

Return ONLY valid JSON in this exact format:

{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "recommendation": ""
}

Rules:
- matchScore must be a number from 0 to 100.
- matchedSkills must contain skills present in both the resume and job requirements.
- missingSkills must contain important job skills that are not clearly present in the resume.
- strengths must contain short points explaining why the candidate matches.
- recommendation must be a short practical recommendation.
`;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: prompt
    });

    const resultText = response.output_text;

    let result;

    try {
      result = JSON.parse(resultText);
    } catch (error) {
      return res.status(500).json({
        message: "AI returned an invalid response",
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
        id: resume._id
      },
      matching: result
    });

  } catch (error) {
    console.error("AI job matching error:", error);

    res.status(500).json({
      message: "Failed to calculate job match",
      error: error.message
    });
  }
});

module.exports = router;