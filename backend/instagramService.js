// ════════════════════════════════════════════════
//  services/instagramService.js
//  Core logic: calls RapidAPI and normalises data
// ════════════════════════════════════════════════
'use strict';

const fetch = require('node-fetch');

const RAPIDAPI_KEY  = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST ||
  'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com';

// ── Helpers ──────────────────────────────────────

/**
 * Builds the RapidAPI request options.
 */
function buildRequestOptions(url) {
  return {
    method:  'GET',
    headers: {
      'x-rapidapi-key':  RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  };
}

/**
 * Converts raw RapidAPI media objects into our clean schema.
 * Normalises differences between the video and image response shapes.
 */
function normaliseMedia(rawMedia, type) {
  // VIDEO (reel / tv)
  if (type === 'reel' || type === 'tv') {
    const versions = rawMedia.video_versions || [];
    return versions.map((v, i) => ({
      quality:  i === 0 ? 'HD' : `SD${i}`,
      label:    i === 0 ? '1080p HD' : `${v.height}p`,
      url:      v.url,
      format:   'mp4',
      width:    v.width,
      height:   v.height,
    }));
  }

  // IMAGE (post / story)
  const candidates = rawMedia.image_versions2?.candidates || [];
  return candidates.slice(0, 2).map((img, i) => ({
    quality: i === 0 ? 'Original' : 'Compressed',
    label:   `${img.width}×${img.height}`,
    url:     img.url,
    format:  'jpg',
    width:   img.width,
    height:  img.height,
  }));
}

// ── Main service function ─────────────────────────

/**
 * Fetches Instagram media info via RapidAPI.
 * @param {string} cleanUrl  - sanitised Instagram URL
 * @param {string} type      - 'reel' | 'post' | 'tv' | 'story'
 * @returns {Promise<Object>} normalised media payload
 */
async function fetchInstagramMedia(cleanUrl, type) {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    throw Object.assign(
      new Error('RAPIDAPI_KEY is not configured. Please add it to your .env file.'),
      { status: 503 }
    );
  }

  const apiUrl = `https://${RAPIDAPI_HOST}/?url=${encodeURIComponent(cleanUrl)}`;

  let response;
  try {
    response = await fetch(apiUrl, buildRequestOptions(cleanUrl));
  } catch (networkErr) {
    throw Object.assign(
      new Error('Network error reaching the download API. Please try again.'),
      { status: 502 }
    );
  }

  // Non-2xx from RapidAPI
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw Object.assign(
        new Error('Invalid or expired RapidAPI key.'),
        { status: 403 }
      );
    }
    if (response.status === 429) {
      throw Object.assign(
        new Error('RapidAPI rate limit reached. Please try again shortly.'),
        { status: 429 }
      );
    }
    throw Object.assign(
      new Error(`Upstream API error: ${response.status}`),
      { status: 502 }
    );
  }

  let json;
  try {
    json = await response.json();
  } catch {
    throw Object.assign(
      new Error('Invalid response from download API.'),
      { status: 502 }
    );
  }

  // The RapidAPI response structure varies by endpoint — normalise it
  // Most Instagram downloader APIs return { media, ... } or an array
  const raw = json?.media ?? json?.data ?? json;

  // Handle carousel (multiple images in one post)
  if (Array.isArray(raw)) {
    return {
      type:      'carousel',
      itemCount: raw.length,
      items:     raw.map((item, i) => ({
        index:  i + 1,
        media:  normaliseMedia(item, 'post'),
      })),
    };
  }

  // Single media item
  const mediaLinks = normaliseMedia(raw, type);

  if (!mediaLinks || mediaLinks.length === 0) {
    throw Object.assign(
      new Error('Could not extract media from this post. It may be private or unsupported.'),
      { status: 422 }
    );
  }

  return {
    type,
    thumbnail: raw.image_versions2?.candidates?.[0]?.url ?? null,
    duration:  raw.video_duration ?? null,
    caption:   raw.caption?.text?.slice(0, 120) ?? null,
    media:     mediaLinks,
  };
}

module.exports = { fetchInstagramMedia };
