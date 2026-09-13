
const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const Application = require("../models/Application");
const protect = require("../middleware/authMiddleware");


// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.userId
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // -------------------------------------------------
    // Add relatedJobId for application notifications
    // -------------------------------------------------
    for (const notification of notifications) {
      if (
        notification.type === "application" &&
        notification.relatedId
      ) {
        try {
          const application =
            await Application.findById(
              notification.relatedId
            ).select("jobId");

          if (application) {
            notification.relatedJobId =
              application.jobId;
          }
        } catch (error) {
          console.error(
            "Failed to resolve notification application:",
            error
          );
        }
      }
    }

    const unreadCount =
      await Notification.countDocuments({
        userId: req.user.userId,
        isRead: false
      });

    res.status(200).json({
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      message: "Failed to load notifications"
    });
  }
});


// =====================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================================

router.patch("/:id/read", protect, async (req, res) => {
  try {
    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user.userId
        },
        {
          isRead: true
        },
        {
          new: true
        }
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.status(200).json({
      message:
        "Notification marked as read",
      notification
    });

  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update notification"
    });
  }
});


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================================

router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        userId: req.user.userId,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.status(200).json({
      message:
        "All notifications marked as read"
    });

  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update notifications"
    });
  }
});


// =====================================================
// DELETE ONE NOTIFICATION
// DELETE /api/notifications/:id
// =====================================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const notification =
      await Notification.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId
      });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.status(200).json({
      message:
        "Notification deleted successfully"
    });

  } catch (error) {
    console.error(
      "Delete notification error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete notification"
    });
  }
});


module.exports = router;

