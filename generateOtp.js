/**
 * Generates a cryptographically random numeric OTP.
 * @param {number} length - Number of digits (default: from env or 6)
 * @returns {string} Zero-padded OTP string
 */
function generateOtp(length = parseInt(process.env.OTP_LENGTH) || 6) {
  const max = Math.pow(10, length);
  const min = Math.pow(10, length - 1);
  const otp = Math.floor(Math.random() * (max - min)) + min;
  return otp.toString();
}

module.exports = generateOtp;
