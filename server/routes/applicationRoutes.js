const express = require("express");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();


// =====================================================
// APPLY FOR A JOB
// POST /api/applications/:jobId
// =====================================================

router.post(
  "/:jobId",
  protect,
  authorizeRoles("job-seeker"),
  async (req, res) => {
    try {
      const { coverLetter, resumeId } = req.body || {};

      // Check whether job exists
      const job = await Job.findById(req.params.jobId);

      if (!job) {
        return res.status(404).json({
          message: "Job not found"
        });
      }

      // Check whether job is active
      if (job.status !== "active") {
        return res.status(400).json({
          message: "This job is no longer active"
        });
      }

      // Check duplicate application
      const existingApplication = await Application.findOne({
        jobId: job._id,
        applicantId: req.user.userId
      });

      if (existingApplication) {
        return res.status(400).json({
          message: "You have already applied for this job"
        });
      }

      // Create application
      const application = await Application.create({
        jobId: job._id,
        applicantId: req.user.userId,
        resumeId: resumeId || null,
        coverLetter: coverLetter || ""
      });

      // Notify recruiter
      await Notification.create({
  userId: job.recruiterId,
  message: `A new application has been received for ${job.title}.`,
  type: "application",
  relatedId: application._id,
  relatedJobId: job._id
});

      res.status(201).json({
        message: "Application submitted successfully",
        application
      });

    } catch (error) {
      console.error("Apply job error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// =====================================================
// GET MY APPLICATIONS
// GET /api/applications/my
// =====================================================

router.get(
  "/my",
  protect,
  authorizeRoles("job-seeker"),
  async (req, res) => {
    try {
      const applications = await Application.find({
        applicantId: req.user.userId
      })
        .populate(
          "jobId",
          "title company location salary jobType experience"
        )
        .sort({ createdAt: -1 });

      res.status(200).json({
        count: applications.length,
        applications
      });

    } catch (error) {
      console.error("Get my applications error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// =====================================================
// GET APPLICANTS FOR A JOB
// GET /api/applications/job/:jobId
// =====================================================

router.get(
  "/job/:jobId",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      // Find job
      const job = await Job.findById(req.params.jobId);

      if (!job) {
        return res.status(404).json({
          message: "Job not found"
        });
      }

      // Check recruiter ownership
      if (job.recruiterId.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "You can only view applicants for your own jobs"
        });
      }

      // Find applications
      const applications = await Application.find({
        jobId: job._id
      })
        .populate(
          "applicantId",
          "name email role"
        )
        .sort({ createdAt: -1 });

      res.status(200).json({
        count: applications.length,
        applications
      });

    } catch (error) {
      console.error("Get applicants error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// =====================================================
// UPDATE APPLICATION STATUS
// PATCH /api/applications/:id/status
// =====================================================

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "Applied",
        "Shortlisted",
        "Interview",
        "Rejected",
        "Hired"
      ];

      // Validate status
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid application status"
        });
      }

      // Find application
      const application = await Application.findById(
        req.params.id
      );

      if (!application) {
        return res.status(404).json({
          message: "Application not found"
        });
      }

      // Find related job
      const job = await Job.findById(
        application.jobId
      );

      if (!job) {
        return res.status(404).json({
          message: "Job not found"
        });
      }

      // Check recruiter ownership
      if (job.recruiterId.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "You can only update applications for your own jobs"
        });
      }

      // Store previous status
      const previousStatus = application.status;

      // Update status
      application.status = status;

      await application.save();

      // Notify job seeker only when status actually changes
      if (previousStatus !== status) {
        await Notification.create({
          userId: application.applicantId,
          message: `Your application for ${job.title} is now ${status}.`,
          type: "status-update",
          relatedId: application._id
        });
      }

      res.status(200).json({
        message: "Application status updated successfully",
        application
      });

    } catch (error) {
      console.error("Update application status error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


module.exports = router;