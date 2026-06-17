/**
 * In-memory store for OTPs keyed by email.
 * Each entry: { otp: string, expiresAt: number, attempts: number }
 *
 * For production, replace with Redis or a persistent store.
 */

const MAX_ATTEMPTS = 3;
const store = new Map();

/**
 * Save an OTP for the given email.
 * @param {string} email
 * @param {string} otp
 * @param {number} ttlMinutes - Time-to-live in minutes
 */
function saveOtp(email, otp, ttlMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) {
  store.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    attempts: 0,
  });
}

/**
 * Verify an OTP for the given email.
 * @param {string} email
 * @param {string} otp
 * @returns {{ valid: boolean, reason?: string }}
 */
function verifyOtp(email, otp) {
  const key = email.toLowerCase();
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

  if (record.otp !== otp) {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      reason: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
    };
  }

  // Success — remove the OTP so it can't be reused
  store.delete(key);
  return { valid: true };
}

/**
 * Delete any stored OTP for the given email (e.g. on re-request).
 * @param {string} email
 */
function deleteOtp(email) {
  store.delete(email.toLowerCase());
}

module.exports = { saveOtp, verifyOtp, deleteOtp };
