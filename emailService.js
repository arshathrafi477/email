const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send an OTP email to the specified address.
 * @param {string} to - Recipient email address
 * @param {string} otp - The one-time password
 * @param {number} expiryMinutes - How long the OTP is valid
 */
async function sendOtpEmail(to, otp, expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) {
  const transport = getTransporter();

  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Your verification code",
    text: `Your OTP is: ${otp}\n\nThis code expires in ${expiryMinutes} minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Verification code</h2>
        <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">
          Use the code below to complete your verification. It expires in <strong>${expiryMinutes} minutes</strong>.
        </p>
        <div style="letter-spacing: 0.25em; font-size: 36px; font-weight: 700; color: #111827; text-align: center; padding: 20px; background: #f9fafb; border-radius: 6px;">
          ${otp}
        </div>
        <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
