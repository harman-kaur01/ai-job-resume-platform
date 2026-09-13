const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // Which job the user applied for
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    // Which user applied
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Resume used for this application
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null
    },

    // Optional cover letter
    coverLetter: {
      type: String,
      default: ""
    },

    // Application status
    status: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Interview",
        "Rejected",
        "Hired"
      ],
      default: "Applied"
    }
  },
  {
    timestamps: true
  }
);


// Prevent duplicate applications
// Same user cannot apply to the same job twice
applicationSchema.index(
  { jobId: 1, applicantId: 1 },
  { unique: true }
);


module.exports = mongoose.model(
  "Application",
  applicationSchema
);