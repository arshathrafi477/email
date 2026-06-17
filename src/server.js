require("dotenv").config();

const express = require("express");
const cors = require("cors");
const otpRouter = require("./otp");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/otp", otpRouter);

// Root health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler — must come after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler — must have 4 params so Express recognises it as an error handler
app.use((err, _req, res, _next) => {
  console.error("[server] Unhandled error:", err.stack || err.message);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`OTP service running → http://localhost:${PORT}`);
  console.log(`Routes: POST /api/otp/send  |  POST /api/otp/verify  |  GET /api/otp/health`);
});
