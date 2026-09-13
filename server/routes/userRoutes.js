
const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

// =========================
// Protected Profile Route
// =========================
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "You are authorized to access this profile",
    user: req.user
  });
});


// =========================
// Admin Only Route
// =========================
router.get(
  "/admin-test",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin! You have admin access.",
      user: req.user
    });
  }
);


module.exports = router;



