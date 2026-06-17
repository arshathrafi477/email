const express = require("express");
const generateOtp = require("./generateOtp");
const { saveOtp, verifyOtp, deleteOtp } = require("./otpStore");
const { sendOtpEmail } = require("./emailService");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/otp/send
 * Body: { email: string }
 * Generates and emails an OTP to the given address.
 */
router.post("/send", async (req, res) => {
  const email = (req.body.email || "").trim();

  if (!email) {
    return res.status(400).json({ success: false, message: "Email address is required." });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address format." });
  }

  try {
    const otp = generateOtp();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

    deleteOtp(email);
    saveOtp(email, otp, expiryMinutes);
    await sendOtpEmail(email, otp, expiryMinutes);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${email}. It expires in ${expiryMinutes} minutes.`,
    });
  } catch (err) {
    console.error("[otp/send] Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
});

/**
 * POST /api/otp/verify
 * Body: { email: string, otp: string }
 * Verifies the OTP for the given email.
 */
router.post("/verify", (req, res) => {
  const email = (req.body.email || "").trim();
  const otp = (req.body.otp || "").toString().trim();

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Both email and OTP are required." });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address format." });
  }

  const result = verifyOtp(email, otp);

  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.reason });
  }

  return res.status(200).json({ success: true, message: "OTP verified successfully." });
});

/**
 * GET /api/otp/health
 * Quick ping to confirm the OTP routes are reachable.
 */
router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OTP service is up." });
});

module.exports = router;
