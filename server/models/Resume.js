const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    fileName: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    fileType: {
      type: String,
      enum: ["pdf", "doc", "docx"],
      required: true
    },

    extractedText: {
      type: String,
      default: ""
    },

    skills: {
      type: [String],
      default: []
    },

    education: {
      type: [String],
      default: []
    },

    experience: {
      type: [String],
      default: []
    },

    aiScore: {
      type: Number,
      default: null
    },

    aiFeedback: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Resume", resumeSchema);