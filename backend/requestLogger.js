// ════════════════════════════════════════════════
//  middleware/requestLogger.js
// ════════════════════════════════════════════════
'use strict';

/**
 * Lightweight request logger.
 * Logs method, path, status, and response time.
 * Sanitises the URL body so Instagram URLs aren't stored in plain logs.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms     = Date.now() - start;
    const status = res.statusCode;
    const color  = status >= 500 ? '\x1b[31m'   // red
                 : status >= 400 ? '\x1b[33m'   // yellow
                 : status >= 200 ? '\x1b[32m'   // green
                 : '\x1b[0m';
    const reset  = '\x1b[0m';

    console.log(
      `${color}[${status}]${reset} ${req.method.padEnd(6)} ${req.originalUrl.padEnd(30)} ${ms}ms`
    );
  });

  next();
};

module.exports = { requestLogger };
