const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Same user same job ko duplicate save nahi kar sakta
savedJobSchema.index(
  { jobId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model("SavedJob", savedJobSchema);