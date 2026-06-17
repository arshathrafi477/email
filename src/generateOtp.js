const crypto = require("crypto");

/**
 * Generates a cryptographically secure numeric OTP.
 * @param {number} length - Number of digits (default from OTP_LENGTH env or 6)
 * @returns {string} Numeric OTP string
 */
function generateOtp(length = parseInt(process.env.OTP_LENGTH) || 6) {
  const max = Math.pow(10, length);
  const min = Math.pow(10, length - 1);
  const range = max - min;

  // Use crypto.randomInt for secure randomness
  const otp = min + crypto.randomInt(0, range);
  return otp.toString();
}

module.exports = generateOtp;
