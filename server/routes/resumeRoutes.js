
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { createWorker } = require("tesseract.js");

const Resume = require("../models/Resume");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

// ======================================
// Upload Directory
// ======================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
  });
}

// ======================================
// Multer Storage
// ======================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1E9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

// ======================================
// File Filter
// ======================================

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx"
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, DOC and DOCX files are allowed"
      ),
      false
    );
  }
};

// ======================================
// Multer Configuration
// ======================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// ======================================
// Skill Extraction
// ======================================

const extractSkills = (text) => {
  const skillList = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C",
    "C++",
    "C#",
    "HTML",
    "CSS",
    "Bootstrap",
    "React",
    "React.js",
    "Angular",
    "Vue.js",
    "Node.js",
    "Express.js",
    "Flask",
    "Django",
    "FastAPI",
    "REST API",
    "REST",
    "MongoDB",
    "MySQL",
    "PostgreSQL",
    "SQL",
    "Oracle",
    "Git",
    "GitHub",
    "Docker",
    "AWS",
    "Power BI",
    "Tableau",
    "Excel",
    "NumPy",
    "Pandas",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Machine Learning",
    "Artificial Intelligence",
    "Data Analysis"
  ];

  const lowerText = text.toLowerCase();

  return [
    ...new Set(
      skillList.filter((skill) =>
        lowerText.includes(
          skill.toLowerCase()
        )
      )
    )
  ];
};

// ======================================
// OCR PDF
// ======================================

const extractTextWithOCR = async (filePath) => {
  console.log("PDF text layer is empty.");
  console.log("Starting OCR...");

  const { pdf } = await import("pdf-to-img");

  const document = await pdf(filePath, {
    scale: 3
  });

  const worker = await createWorker("eng");

  let fullText = "";
  let pageNumber = 1;

  try {
    for await (const image of document) {
      console.log(
        `Running OCR on page ${pageNumber}...`
      );

      const result =
        await worker.recognize(image);

      fullText +=
        result.data.text + "\n";

      pageNumber++;
    }
  } finally {
    await worker.terminate();
    await document.destroy();
  }

  return fullText.trim();
};

// ======================================
// Upload Resume
// ======================================

router.post(
  "/upload",
  protect,
  authorizeRoles("job-seeker"),
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a resume"
        });
      }

      const extension = path
        .extname(req.file.originalname)
        .toLowerCase()
        .replace(".", "");

      let extractedText = "";

      // ==================================
      // PDF
      // ==================================

      if (extension === "pdf") {
        const fileBuffer =
          fs.readFileSync(req.file.path);

        const pdfData =
          await pdfParse(fileBuffer);

        extractedText =
          pdfData.text.trim();

        // If normal extraction fails,
        // use OCR.
        if (!extractedText) {
          extractedText =
            await extractTextWithOCR(
              req.file.path
            );
        }
      }

      // ==================================
      // DOCX
      // ==================================

      if (extension === "docx") {
        const result =
          await mammoth.extractRawText({
            path: req.file.path
          });

        extractedText =
          result.value.trim();
      }

      // ==================================
      // DOC
      // ==================================

      if (extension === "doc") {
        extractedText =
          "DOC text extraction is not currently supported.";
      }

      // ==================================
      // Detect Skills
      // ==================================

      const skills =
        extractSkills(extractedText);

      console.log(
        "Detected skills:",
        skills
      );

      // ==================================
      // Save Resume
      // ==================================

      const resume =
        await Resume.create({
          userId: req.user.userId,

          fileName:
            req.file.originalname,

          filePath:
            req.file.path,

          fileType:
            extension,

          extractedText,

          skills,

          education: [],

          experience: [],

          aiScore: null,

          aiFeedback: ""
        });

      // ==================================
      // Response
      // ==================================

      res.status(201).json({
        message:
          "Resume uploaded, text extracted and skills detected successfully",

        resume
      });

    } catch (error) {
      console.error(
        "Resume processing error:",
        error
      );

      res.status(500).json({
        message:
          "Resume processing failed",

        error:
          error.message
      });
    }
  }
);

// ======================================
// Get My Resumes
// ======================================

router.get(
  "/my",
  protect,
  authorizeRoles("job-seeker"),
  async (req, res) => {
    try {
      const resumes =
        await Resume.find({
          userId: req.user.userId
        }).sort({
          createdAt: -1
        });

      res.status(200).json({
        count: resumes.length,
        resumes
      });

    } catch (error) {
      console.error(
        "Get my resumes error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch resumes"
      });
    }
  }
);

module.exports = router;

