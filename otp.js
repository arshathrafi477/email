const express = require("express");
const generateOtp = require("./generateOtp");
const { saveOtp, verifyOtp, deleteOtp } = require("./otpStore");
const { sendOtpEmail } = require("./emailService");

const router = express.Router();

/**
 * POST /otp/send
 * Body: { email: string }
 *
 * Generates and emails an OTP to the given address.
 */
router.post("/send", async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ success: false, message: "A valid email address is required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address format." });
  }

  try {
    const otp = generateOtp();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

    // Remove any existing OTP before saving the new one
    deleteOtp(email);
    saveOtp(email, otp, expiryMinutes);

    await sendOtpEmail(email, otp, expiryMinutes);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${email}. It expires in ${expiryMinutes} minutes.`,
    });
  } catch (err) {
    console.error("Failed to send OTP:", err.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
  }
});

/**
 * POST /otp/verify
 * Body: { email: string, otp: string }
 *
 * Verifies the OTP submitted for the given email.
 */
router.post("/verify", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Both email and OTP are required." });
  }

  const result = verifyOtp(email, otp.toString().trim());

  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.reason });
  }

  return res.status(200).json({ success: true, message: "OTP verified successfully." });
});

module.exports = router;
