// ════════════════════════════════════════════════
//  middleware/rateLimiter.js
// ════════════════════════════════════════════════
'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Global API rate limiter.
 * Default: 50 requests per IP per 15 minutes.
 * Override via .env: RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX
 */
const limiter = rateLimit({
  windowMs:         parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:              parseInt(process.env.RATE_LIMIT_MAX)        || 50,
  standardHeaders:  true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders:    false,

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error:   'Too many requests. Please slow down and try again in a few minutes.',
      retryAfter: Math.ceil(
        (req.rateLimit.resetTime - Date.now()) / 1000
      ) + 's',
    });
  },
});

/**
 * Stricter limiter for the /download endpoint specifically.
 * 20 downloads per IP per 15 minutes.
 */
const downloadLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,

  handler: (req, res) => {
    res.status(429).json({
      success:    false,
      error:      'Download limit reached. You can download up to 20 files every 15 minutes.',
      retryAfter: Math.ceil(
        (req.rateLimit.resetTime - Date.now()) / 1000
      ) + 's',
    });
  },
});

module.exports = { limiter, downloadLimiter };
