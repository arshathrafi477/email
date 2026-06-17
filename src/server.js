require("dotenv").config();

const express = require("express");
const cors = require("cors");
const otpRouter = require("./otp");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "OTP Verification API Running"
  });
});

// Health Check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

// OTP Routes
app.use("/api/otp", otpRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
