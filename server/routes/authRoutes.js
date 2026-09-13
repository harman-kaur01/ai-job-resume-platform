
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const rateLimit = require("express-rate-limit");

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message:
      "Too many authentication attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});


// =========================
// REGISTER USER
// =========================
router.post(
  "/register",
  authLimiter,
  async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role
    } = req.body || {};

    // -------------------------
    // Required fields
    // -------------------------
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    // -------------------------
    // Validate name
    // -------------------------
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters"
      });
    }

    // -------------------------
    // Normalize email
    // -------------------------
    const normalizedEmail =
      email.trim().toLowerCase();

    // -------------------------
    // Validate email format
    // -------------------------
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    // -------------------------
    // Validate password
    // -------------------------
    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long"
      });
    }

    // -------------------------
    // Validate role
    // -------------------------
    // Users can register only as:
    // job-seeker or recruiter.
    // Admin accounts must not be
    // created through public registration.
    const allowedRoles = [
      "job-seeker",
      "recruiter"
    ];

    const selectedRole =
      role || "job-seeker";

    if (!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        message: "Invalid user role"
      });
    }

    // -------------------------
    // Check existing user
    // -------------------------
    const existingUser =
      await User.findOne({
        email: normalizedEmail
      });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // -------------------------
    // Hash password
    // -------------------------
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // -------------------------
    // Create user
    // -------------------------
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: selectedRole
    });

    // -------------------------
    // Response
    // -------------------------
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
});


// =========================
// LOGIN USER
// =========================
router.post(
  "/login",
  authLimiter,
  async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body || {};

    // -------------------------
    // Required fields
    // -------------------------
    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required"
      });
    }

    // -------------------------
    // Normalize email
    // -------------------------
    const normalizedEmail =
      email.trim().toLowerCase();

    // -------------------------
    // Validate email format
    // -------------------------
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message:
          "Please enter a valid email address"
      });
    }

    // -------------------------
    // Find user
    // -------------------------
    const user =
      await User.findOne({
        email: normalizedEmail
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password"
      });
    }

    // -------------------------
    // Compare password
    // -------------------------
    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Invalid email or password"
      });
    }

    // -------------------------
    // Generate JWT
    // -------------------------
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    // -------------------------
    // Response
    // -------------------------
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
});


module.exports = router;

