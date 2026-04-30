// ════════════════════════════════════════════════
//  middleware/errorHandler.js
// ════════════════════════════════════════════════
'use strict';

/**
 * Central error handler — catches anything passed via next(err).
 * Keeps error details hidden in production.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  // Log error server-side always
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  // CORS errors
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      error:   err.message,
    });
  }

  // JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error:   'Invalid JSON in request body.',
    });
  }

  // Generic fallback
  res.status(err.status || 500).json({
    success: false,
    error:   isDev ? err.message : 'Internal server error. Please try again.',
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
