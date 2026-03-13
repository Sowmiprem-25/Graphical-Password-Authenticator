const rateLimit = require('express-rate-limit');
const { query } = require('../config/db');
const { sendSecurityAlertEmail } = require('../utils/email');

// ── Global rate limiter (loose, anti-flood) ──────────────────
const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

// ── Auth rate limiter (strict, per-login) ────────────────────
const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  },
  handler: async (req, res) => {
    const email = req.body?.email || null;
    if (email) {
      try {
        const user = await query('SELECT id, name, email FROM users WHERE email=$1', [email]);
        if (user.rows.length > 0) {
          const u = user.rows[0];
          const userId = u.id;
          await query(
            `INSERT INTO security_alerts (user_id, alert_type, severity, message, ip_address)
             VALUES ($1, 'rapid_attempts', 'high', $2, $3)`,
            [userId, `Rapid login attempts from IP ${req.ip}`, req.ip]
          );

          await sendSecurityAlertEmail(u.email, u.name, {
            message: `Unusually high volume of rapid login attempts detected from your IP address. This could indicate a brute-force attack.`,
            ip: req.ip,
            userAgent: req.headers['user-agent'] || 'unknown',
            timestamp: new Date()
          });
        }
      } catch (_) {}
    }
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please wait 1 minute before trying again.',
      retryAfter: 60,
    });
  },
  skip: (req) => req.method === 'GET',
});

module.exports = { globalRateLimiter, authRateLimiter };
