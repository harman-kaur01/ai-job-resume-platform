const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: [
        "application",
        "status-update",
        "job",
        "system"
      ],
      default: "system"
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
relatedJobId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Job",
  default: null
},
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);