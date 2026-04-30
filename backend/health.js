// ════════════════════════════════════════════════
//  routes/health.js
// ════════════════════════════════════════════════
'use strict';

const express = require('express');
const router  = express.Router();

const START_TIME = Date.now();

// GET /api/health
router.get('/', (req, res) => {
  const uptimeMs = Date.now() - START_TIME;
  const uptimeSec = Math.floor(uptimeMs / 1000);

  res.status(200).json({
    success:   true,
    status:    'ok',
    service:   'GrabReel API',
    version:   '1.0.0',
    env:       process.env.NODE_ENV || 'development',
    uptime:    `${uptimeSec}s`,
    timestamp: new Date().toISOString(),
    rapidapi:  process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_KEY !== 'your_rapidapi_key_here'
               ? 'configured'
               : 'not configured ⚠️',
  });
});

module.exports = router;
