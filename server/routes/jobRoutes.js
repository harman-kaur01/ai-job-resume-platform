

const express = require("express");
const Job = require("../models/Job");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();


// =========================
// CREATE JOB
// Recruiter only
// =========================
router.post(
  "/",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const {
        title,
        company,
        location,
        description,
        skills,
        salary,
        jobType,
        experience
      } = req.body;

      if (
        !title ||
        !company ||
        !location ||
        !description ||
        !skills
      ) {
        return res.status(400).json({
          message: "Please fill all required fields"
        });
      }

      const job = await Job.create({
        title,
        company,
        location,
        description,
        skills,
        salary,
        jobType,
        experience,
        recruiterId: req.user.userId
      });

      res.status(201).json({
        message: "Job created successfully",
        job
      });

    } catch (error) {
      console.error("Create job error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// =========================
// GET ALL ACTIVE JOBS
// Search + Filter + Pagination
// Public
// =========================
router.get("/", async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      experience,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {
      status: "active"
    };

    // Search by title, company or skills
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i"
          }
        },
        {
          company: {
            $regex: search,
            $options: "i"
          }
        },
        {
          skills: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    // Location filter
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i"
      };
    }

    // Job type filter
    if (jobType) {
      filter.jobType = jobType;
    }

    // Experience filter
    if (experience) {
      filter.experience = experience;
    }

    const pageNumber = Math.max(parseInt(page), 1);

    const limitNumber = Math.min(
      Math.max(parseInt(limit), 1),
      50
    );

    const skip = (pageNumber - 1) * limitNumber;

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalJobs = await Job.countDocuments(filter);

    res.status(200).json({
      count: jobs.length,
      totalJobs,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalJobs / limitNumber),
      jobs
    });

  } catch (error) {
    console.error("Get jobs error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// =========================
// GET RECRUITER'S JOBS
// Recruiter only
// =========================
router.get(
  "/recruiter/my",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const jobs = await Job.find({
        recruiterId: req.user.userId
      }).sort({ createdAt: -1 });

      res.status(200).json({
        count: jobs.length,
        jobs
      });

    } catch (error) {
      console.error("Get recruiter jobs error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// =========================
// GET SINGLE JOB
// Public
// =========================
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    res.status(200).json({
      job
    });

  } catch (error) {
    res.status(500).json({
      message: "Invalid job ID"
    });
  }
});


// =========================
// UPDATE JOB
// Recruiter only
// =========================
router.put(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          message: "Job not found"
        });
      }

      // Only job owner can update
      if (job.recruiterId.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "You can only update your own jobs"
        });
      }

      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

      res.status(200).json({
        message: "Job updated successfully",
        job: updatedJob
      });

    } catch (error) {
      console.error("Update job error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// =========================
// DELETE JOB
// Recruiter only
// =========================
router.delete(
  "/:id",
  protect,
  authorizeRoles("recruiter"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          message: "Job not found"
        });
      }

      // Only job owner can delete
      if (job.recruiterId.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "You can only delete your own jobs"
        });
      }

      await Job.findByIdAndDelete(req.params.id);

      res.status(200).json({
        message: "Job deleted successfully"
      });

    } catch (error) {
      console.error("Delete job error:", error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


module.exports = router;

