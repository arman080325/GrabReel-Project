// ════════════════════════════════════════════════
//  utils/validator.js
// ════════════════════════════════════════════════
'use strict';

// Supported Instagram URL patterns
const PATTERNS = {
  reel:   /instagram\.com\/reel\/([A-Za-z0-9_\-]+)/,
  post:   /instagram\.com\/p\/([A-Za-z0-9_\-]+)/,
  tv:     /instagram\.com\/tv\/([A-Za-z0-9_\-]+)/,
  story:  /instagram\.com\/stories\/[^/]+\/([A-Za-z0-9_\-]+)/,
};

/**
 * Validates and classifies an Instagram URL.
 * @param {string} url
 * @returns {{ valid: boolean, type: string|null, shortcode: string|null, error: string|null }}
 */
function validateInstagramUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, type: null, shortcode: null, error: 'URL is required.' };
  }

  const trimmed = url.trim();

  // Must start with http(s)
  if (!/^https?:\/\//i.test(trimmed)) {
    return { valid: false, type: null, shortcode: null, error: 'URL must start with http:// or https://' };
  }

  // Must be instagram.com
  if (!/instagram\.com/i.test(trimmed)) {
    return { valid: false, type: null, shortcode: null, error: 'Only Instagram URLs are supported.' };
  }

  // Match against known patterns
  for (const [type, regex] of Object.entries(PATTERNS)) {
    const match = trimmed.match(regex);
    if (match) {
      return { valid: true, type, shortcode: match[1], error: null };
    }
  }

  return {
    valid:     false,
    type:      null,
    shortcode: null,
    error:     'Unsupported Instagram URL. Supported: posts (/p/), reels (/reel/), TV (/tv/), and stories.',
  };
}

/**
 * Sanitises a URL — strips query params and fragments for clean API calls.
 * @param {string} url
 * @returns {string}
 */
function sanitiseUrl(url) {
  try {
    const u = new URL(url.trim());
    // Keep only origin + pathname
    return `${u.origin}${u.pathname}`.replace(/\/$/, '');
  } catch {
    return url.trim();
  }
}

module.exports = { validateInstagramUrl, sanitiseUrl };
