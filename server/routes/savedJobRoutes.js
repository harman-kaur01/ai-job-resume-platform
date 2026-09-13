const express = require("express");
const SavedJob = require("../models/SavedJob");
const Job = require("../models/Job");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();


// =====================================================
// SAVE JOB
// POST /api/saved-jobs/:jobId
// =====================================================

router.post(
  "/:jobId",
  protect,
  authorizeRoles("job-seeker"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.jobId);

      if (!job) {
        return res.status(404).json({
          message: "Job not found"
        });
      }

      if (job.status !== "active") {
        return res.status(400).json({
          message: "This job is no longer active"
        });
      }

      const existingSavedJob = await SavedJob.findOne({
        jobId: job._id,
        userId: req.user.userId
      });

      if (existingSavedJob) {
        return res.status(400).json({
          message: "Job already saved"
        });
      }

      const savedJob = await SavedJob.create({
        jobId: job._id,
        userId: req.user.userId
      });

      res.status(201).json({
        message: "Job saved successfully",
        savedJob
      });

    } catch (error) {
      console.error("Save job error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// =====================================================
// GET MY SAVED JOBS
// GET /api/saved-jobs/my
// =====================================================

router.get(
  "/my",
  protect,
  authorizeRoles("job-seeker"),
  async (req, res) => {
    try {
      const savedJobs = await SavedJob.find({
        userId: req.user.userId
      })
        .populate(
          "jobId",
          "title company location salary jobType experience status"
        )
        .sort({ createdAt: -1 });

      res.status(200).json({
        count: savedJobs.length,
        savedJobs
      });

    } catch (error) {
      console.error("Get saved jobs error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// =====================================================
// REMOVE SAVED JOB
// DELETE /api/saved-jobs/:jobId
// =====================================================

router.delete(
  "/:jobId",
  protect,
  authorizeRoles("job-seeker"),
  async (req, res) => {
    try {
      const savedJob = await SavedJob.findOneAndDelete({
        jobId: req.params.jobId,
        userId: req.user.userId
      });

      if (!savedJob) {
        return res.status(404).json({
          message: "Saved job not found"
        });
      }

      res.status(200).json({
        message: "Job removed from saved jobs"
      });

    } catch (error) {
      console.error("Remove saved job error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


module.exports = router;