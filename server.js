// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Security / Utils ----
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---- Rate Limit ----
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 requests per IP
});
app.use("/api/", limiter);

// ---- Serve static frontend files ----
app.use(express.static(path.join(__dirname, "public")));

// Catch-all route to serve index.html for frontend SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---- File upload setup (Career form) ----
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF/DOC/DOCX allowed"));
  },
});

// ---- Nodemailer transporter ----
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465,
  secure:
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter
  .verify()
  .then(() => console.log("✅ SMTP ready"))
  .catch((e) => console.error("❌ SMTP error:", e.message));

// ---- Helper: HTML escape ----
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---- Backend Routes ----

// Contact form
app.post(
  "/api/contact",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("loanType").trim().notEmpty().withMessage("Loan type required"),
    body("message").trim().isLength({ min: 5 }).withMessage("Message required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, loanType, message } = req.body;
    try {
      await transporter.sendMail({
        from: `"Credify Contact" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO || process.env.SMTP_USER,
        subject: "New Contact Form Submission [Credify]",
        html: `
          <h2>Contact Form Submission</h2>
          <p><b>Name:</b> ${escapeHtml(name)}</p>
          <p><b>Email:</b> ${escapeHtml(email)}</p>
          <p><b>Loan Type:</b> ${escapeHtml(loanType)}</p>
          <p><b>Message:</b><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `,
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Email failed" });
    }
  }
);

// Career form
app.post(
  "/api/career",
  upload.single("resume"),
  [
    body("fullName").trim().isLength({ min: 2 }).withMessage("Full name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("phone").trim().isLength({ min: 7 }).withMessage("Phone required"),
    body("role").trim().notEmpty().withMessage("Role required"),
    body("experience").trim().notEmpty().withMessage("Experience required"),
    body("message").optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    if (!req.file)
      return res.status(400).json({ success: false, error: "Resume required" });

    const { fullName, email, phone, role, experience, message } = req.body;

    try {
      await transporter.sendMail({
        from: `"Credify Careers" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO || process.env.SMTP_USER,
        subject: `New Career Application [${role}] - ${fullName}`,
        html: `
          <h2>Career Application</h2>
          <p><b>Name:</b> ${escapeHtml(fullName)}</p>
          <p><b>Email:</b> ${escapeHtml(email)}</p>
          <p><b>Phone:</b> ${escapeHtml(phone)}</p>
          <p><b>Role:</b> ${escapeHtml(role)}</p>
          <p><b>Experience:</b> ${escapeHtml(experience)}</p>
          ${
            message
              ? `<p><b>Message:</b><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`
              : ""
          }
        `,
        attachments: [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
            contentType: req.file.mimetype,
          },
        ],
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Email failed" });
    }
  }
);

// Loan application form
app.post("/api/apply", async (req, res) => {
  const {
    referenceId,
    loanType,
    fullName,
    mobile,
    email,
    dob,
    income,
    employment,
    loanAmount,
    city,
  } = req.body;

  if (!fullName || !mobile || !email || !loanType) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  try {
    await transporter.sendMail({
      from: `"${fullName} via Credify" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_TO || process.env.SMTP_USER,
      subject: `New Loan Application - ${referenceId}`,
      html: `
        <h2>New Loan Application Received</h2>
        <p><b>Reference ID:</b> ${referenceId}</p>
        <p><b>Loan Type:</b> ${loanType}</p>
        <p><b>Full Name:</b> ${fullName}</p>
        <p><b>Mobile:</b> ${mobile}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>DOB:</b> ${dob}</p>
        <p><b>Monthly Income:</b> ${income}</p>
        <p><b>Employment Type:</b> ${employment}</p>
        <p><b>Loan Amount:</b> ₹${loanAmount}</p>
        <p><b>City:</b> ${city}</p>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ success: false, error: "Email failed" });
  }
});

// ---- Global error handler ----
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("allowed")) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next(err);
});

// ---- Start server ----
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
