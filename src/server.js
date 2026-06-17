require("dotenv").config();

const express = require("express");
const cors = require("cors");
const otpRouter = require("./otp");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger ───────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Root Route ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "OTP Verification API Running",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      sendOTP: "POST /api/otp/send",
      verifyOTP: "POST /api/otp/verify"
    }
  });
});

// ─── Health Check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
});

// ─── OTP Routes ───────────────────────────────────────────────
app.use("/api/otp", otpRouter);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.url}' not found.`
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("─────────────────────────────────────");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("─────────────────────────────────────");
});
