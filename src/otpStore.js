/**
 * In-memory OTP store keyed by lowercase email.
 * Entry shape: { otp: string, expiresAt: number, attempts: number }
 *
 * For production swap this Map for Redis to survive restarts
 * and work across multiple instances.
 */

const MAX_ATTEMPTS = 3;
const store = new Map();

/**
 * Persist an OTP for the given email address.
 * @param {string} email
 * @param {string} otp
 * @param {number} ttlMinutes
 */
function saveOtp(email, otp, ttlMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) {
  store.set(email.toLowerCase().trim(), {
    otp,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    attempts: 0,
  });
}

/**
 * Verify an OTP for the given email.
 * Handles expiry, attempt lockout, and single-use deletion on success.
 * @param {string} email
 * @param {string} otp
 * @returns {{ valid: boolean, reason?: string }}
 */
function verifyOtp(email, otp) {
  const key = email.toLowerCase().trim();
  const record = store.get(key);

  if (!record) {
    return { valid: false, reason: "No OTP found for this email. Please request a new one." };
  }

  if (Date.now() > record.expiresAt) {
    store.delete(key);
    return { valid: false, reason: "OTP has expired. Please request a new one." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    return { valid: false, reason: "Too many failed attempts. Please request a new OTP." };
  }

  if (record.otp !== otp.toString().trim()) {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      reason: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
    };
  }

  // Verified — remove immediately so code can't be reused
  store.delete(key);
  return { valid: true };
}

/**
 * Remove any stored OTP for the given email.
 * Call this before issuing a fresh OTP.
 * @param {string} email
 */
function deleteOtp(email) {
  store.delete(email.toLowerCase().trim());
}

module.exports = { saveOtp, verifyOtp, deleteOtp };
