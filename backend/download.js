// ════════════════════════════════════════════════
//  routes/download.js
// ════════════════════════════════════════════════
'use strict';

const express = require('express');
const router  = express.Router();

const { downloadLimiter }           = require('../middleware/rateLimiter');
const { validateInstagramUrl,
        sanitiseUrl }               = require('../utils/validator');
const { successResponse,
        errorResponse }             = require('../utils/responseFormatter');
const { fetchInstagramMedia }       = require('../services/instagramService');

// ── POST /api/download ───────────────────────────
/**
 * Body: { url: "https://www.instagram.com/reel/..." }
 * Returns normalised media links ready for the frontend.
 */
router.post('/', downloadLimiter, async (req, res, next) => {
  try {
    const { url } = req.body;

    // 1. Validate
    const validation = validateInstagramUrl(url);
    if (!validation.valid) {
      return errorResponse(res, validation.error, 400);
    }

    // 2. Sanitise (strip tracking params)
    const cleanUrl = sanitiseUrl(url);

    // 3. Fetch from RapidAPI
    const mediaData = await fetchInstagramMedia(cleanUrl, validation.type);

    // 4. Respond
    return successResponse(res, {
      shortcode: validation.shortcode,
      ...mediaData,
    });

  } catch (err) {
    // Known operational errors (4xx/5xx we threw ourselves)
    if (err.status) {
      return errorResponse(res, err.message, err.status);
    }
    // Unknown — pass to global error handler
    next(err);
  }
});

// ── GET /api/download (friendly error) ───────────
router.get('/', (req, res) => {
  return errorResponse(
    res,
    'Use POST /api/download with a JSON body: { "url": "<instagram_url>" }',
    405
  );
});

module.exports = router;
