// ════════════════════════════════════════════════
//  utils/responseFormatter.js
// ════════════════════════════════════════════════
'use strict';

/**
 * Formats a successful API response.
 */
function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success:   true,
    timestamp: new Date().toISOString(),
    data,
  });
}

/**
 * Formats an error API response.
 */
function errorResponse(res, message, statusCode = 400, details = null) {
  const body = {
    success:   false,
    timestamp: new Date().toISOString(),
    error:     message,
  };
  if (details && process.env.NODE_ENV !== 'production') {
    body.details = details;
  }
  return res.status(statusCode).json(body);
}

module.exports = { successResponse, errorResponse };
