// server.js
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------- Security & Middlewares ----------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
});
app.use("/api/", limiter);

// ---------------- File Upload (Career Resume) ----------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ok = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (ok.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF/DOC/DOCX allowed"));
  },
});

// ---------------- Brevo SMTP Transporter ----------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  secure: false, // Brevo ke liye mostly false rakho
  auth: {
    user: process.env.EMAIL_USER, // teri Gmail (jo Brevo me verify ki hai)
    pass: process.env.EMAIL_PASS, // Brevo SMTP key
  },
});

transporter
  .verify()
  .then(() => console.log("✅ SMTP ready with Brevo"))
  .catch((e) => console.error("❌ SMTP error:", e.message));

// ---------------- Utility ----------------
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------------- Routes ----------------

// Contact Form
app.post("/api/contact", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, loanType, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"Credify Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
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
    console.error("Email error:", err);
    res.status(500).json({ success: false, error: "Email failed" });
  }
});

// Career Form (with resume attachment)
app.post("/api/career", upload.single("resume"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, error: "Resume required" });

  const { fullName, email, phone, role, experience, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"Credify Careers" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
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
    console.error("Email error:", err);
    res.status(500).json({ success: false, error: "Email failed" });
  }
});

// Loan Apply Form
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
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    await transporter.sendMail({
      from: `"Credify Loan Apply" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
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
    console.error("Email error:", err);
    res.status(500).json({ success: false, error: "Email failed" });
  }
});

// ---------------- Default Route ----------------
app.get("/", (_, res) => res.send("Credify backend is live ✅"));

// ---------------- Start Server ----------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
