# OTP Verification Service

A lightweight Node.js + Express backend for email-based one-time password (OTP) verification.

---

## Features

- Generate a secure numeric OTP
- Send it via email using Nodemailer (works with Gmail, SendGrid, Mailgun, and any SMTP provider)
- Verify OTPs with expiry enforcement and attempt lockout
- Auto-invalidate codes after use — no replay attacks

---

## Project Structure

```
otp-verification/
│
├── .env.example          # Environment variable template
├── package.json
│
└── src/
    ├── server.js         # Express app entry point
    ├── otp.js            # Route handlers (POST /otp/send, POST /otp/verify)
    ├── emailService.js   # Nodemailer transporter + email template
    ├── generateOtp.js    # Random OTP generator
    └── otpStore.js       # In-memory store with expiry + attempt tracking
```

---

## Prerequisites

- Node.js v18+
- An SMTP email account (Gmail, SendGrid, etc.)

---

## Setup

**1. Clone and install**

```bash
git clone <your-repo-url>
cd otp-verification
npm install
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` and fill in your SMTP credentials:

```env
PORT=3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="OTP Service <your-email@gmail.com>"

OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
```

> **Gmail users:** Enable 2FA and generate an [App Password](https://myaccount.google.com/apppasswords). Use the app password as `EMAIL_PASS`, not your account password.

**3. Start the server**

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

The server runs at `http://localhost:3000`.

---

## API Reference

### `POST /otp/send`

Generates and emails an OTP to the given address.

**Request body**

```json
{ "email": "user@example.com" }
```

**Success response** `200`

```json
{
  "success": true,
  "message": "OTP sent to user@example.com. It expires in 10 minutes."
}
```

**Error responses**

| Status | Reason |
|--------|--------|
| `400` | Missing or invalid email address |
| `500` | Email send failure (check SMTP credentials) |

---

### `POST /otp/verify`

Verifies the OTP submitted by the user.

**Request body**

```json
{ "email": "user@example.com", "otp": "482910" }
```

**Success response** `200`

```json
{
  "success": true,
  "message": "OTP verified successfully."
}
```

**Error responses**

| Status | Reason |
|--------|--------|
| `400` | Missing fields, wrong OTP, expired OTP, or too many attempts |

---

### `GET /health`

Health check endpoint.

```json
{ "status": "ok", "timestamp": "2024-06-17T10:00:00.000Z" }
```

---

## OTP Rules

| Setting | Default | Env variable |
|---------|---------|--------------|
| Length | 6 digits | `OTP_LENGTH` |
| Expiry | 10 minutes | `OTP_EXPIRY_MINUTES` |
| Max attempts | 3 | hardcoded in `otpStore.js` |

- Requesting a new OTP invalidates any existing one for that email.
- A verified OTP is immediately deleted — codes cannot be reused.
- After 3 failed attempts, the OTP is deleted and a new one must be requested.

---

## Quick Test with cURL

```bash
# Send an OTP
curl -X POST http://localhost:3000/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'

# Verify the OTP (replace 123456 with the code from your inbox)
curl -X POST http://localhost:3000/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","otp":"123456"}'
```

---

## Production Considerations

| Topic | Recommendation |
|-------|---------------|
| **OTP store** | Replace the in-memory `Map` in `otpStore.js` with Redis for persistence across restarts and horizontal scaling |
| **Rate limiting** | Add `express-rate-limit` on `/otp/send` to prevent abuse |
| **HTTPS** | Run behind a reverse proxy (nginx, Caddy) with TLS in production |
| **Secrets** | Never commit `.env` — use a secrets manager (AWS Secrets Manager, Vault, etc.) |
| **Logging** | Replace `console.error` with a structured logger like `pino` or `winston` |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server and routing |
| `nodemailer` | SMTP email sending |
| `dotenv` | Environment variable loading |
| `nodemon` *(dev)* | Auto-restart on file changes |

---

## License

MIT
