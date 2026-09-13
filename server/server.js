const savedJobRoutes = require("./routes/savedJobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const resumeAnalysisRoutes = require("./routes/resumeAnalysisRoutes");
const aiTestRoutes = require("./routes/aiTestRoutes");
const jobMatchingRoutes = require("./routes/jobMatchingRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const skillGapRoutes = require("./routes/skillGapRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/user", userRoutes);

// Job routes
app.use("/api/jobs", jobRoutes);

// Application routes
app.use("/api/applications", applicationRoutes);

// Saved jobs routes
app.use("/api/saved-jobs", savedJobRoutes);

// Resume routes
app.use("/api/resumes", resumeRoutes);

// Server test
app.get("/server-test", (req, res) => {
  res.json({
    message: "This is the correct server.js"
  });
});

// Resume analysis
app.use(
  "/api/resume-analysis",
  resumeAnalysisRoutes
);

// AI test
app.use("/api/ai", aiTestRoutes);

// AI Job Matching
app.use("/api/job-matching", jobMatchingRoutes);
app.use(
  "/api/recommendations",
  recommendationRoutes
);
app.use(
  "/api/skill-gap",
  skillGapRoutes
);
app.use("/api/notifications", notificationRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "AI Job & Resume Platform API is running!"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});