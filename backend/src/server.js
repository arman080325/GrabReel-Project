require("dotenv").config();

const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");
const fetch     = require("node-fetch");
const https     = require("https");
const http      = require("http");

const app  = express();
const PORT = process.env.PORT || 5000;

if (!process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === "your_rapidapi_key_here") {
  console.error("ERROR: RAPIDAPI_KEY missing in .env");
  process.exit(1);
}

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "null",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("CORS blocked: " + origin));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, error: "Too many requests. Try again in 15 minutes." },
}));

const dlLimiter = rateLimit({
  windowMs: 60 * 1000, max: 20,
  message: { success: false, error: "Download limit reached. Wait a minute." },
});

// ══════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════
function isValidInstagramUrl(url) {
  try {
    const p = new URL(url);
    return ["www.instagram.com","instagram.com"].includes(p.hostname)
      && /^\/(p|reel|tv|stories)\/[A-Za-z0-9_-]+/.test(p.pathname);
  } catch { return false; }
}

function isValidYouTubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[A-Za-z0-9_-]+/.test(url);
}

function extractYouTubeId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

function detectIGType(url) {
  if (url.includes("/reel/"))    return "reel";
  if (url.includes("/tv/"))      return "igtv";
  if (url.includes("/stories/")) return "story";
  return "post";
}

// ══════════════════════════════════════════
//  NORMALIZERS
// ══════════════════════════════════════════
function normalizeInstagram(apiData, urlType) {
  const mediaArray = apiData?.media;
  if (!Array.isArray(mediaArray) || mediaArray.length === 0) return null;

  const thumbnail  = mediaArray[0]?.thumbnail || mediaArray[0]?.url || "";
  const isCarousel = mediaArray.length > 1;
  const hasVideo   = mediaArray.some(m => m.type === "video");

  let mediaType;
  if (urlType === "reel" || urlType === "igtv") mediaType = "video";
  else if (isCarousel) mediaType = "carousel";
  else if (hasVideo)   mediaType = "video";
  else                 mediaType = "image";

  const downloads = mediaArray.map((item, i) => {
    const isVid = item.type === "video";
    return {
      quality:  isCarousel ? `#${i+1}` : (item.quality || "HD"),
      label:    isCarousel ? `Slide ${i+1} · ${isVid?"MP4":"JPG"}` : `${item.quality||"HD"} · ${isVid?"MP4 Video":"JPG Image"}`,
      url:      item.url,
      ext:      isVid ? "mp4" : "jpg",
      hasAudio: isVid,
    };
  });

  return { platform:"instagram", mediaType, thumbnail, caption:"", duration:null, likeCount:0, downloads };
}

function normalizeYouTube(apiData) {
  if (apiData.status !== "ok" || !Array.isArray(apiData.results)) return null;

  const title     = apiData.title     || "YouTube Video";
  const thumbnail = apiData.thumbnail || "";
  const duration  = apiData.duration  || null;
  const results   = apiData.results;

  // Find the best audio stream
  const audioStream = results.find(r => r.mime === "audio/mp4" && r.quality === "M4A")
                   || results.find(r => r.mime === "audio/mp4")
                   || results.find(r => r.has_audio);

  const priorityQualities = ["720p","480p","360p","240p","144p","1080p"];
  const seen      = new Set();
  const downloads = [];

  // Build video+audio pairs — label clearly
  for (const q of priorityQualities) {
    // Try to find a stream that already has audio
    const withAudio = results.find(r => r.quality === q && r.has_audio && r.mime === "video/mp4");
    if (withAudio && !seen.has(q)) {
      seen.add(q);
      downloads.push({
        quality:  q,
        label:    `${q} · MP4 · With Audio`,
        url:      withAudio.url,
        audioUrl: null,
        ext:      "mp4",
        hasAudio: true,
        type:     "video",
      });
      continue;
    }

    // Pair video-only with audio stream
    const videoOnly = results.find(r => r.quality === q && !r.has_audio && r.mime === "video/mp4");
    if (videoOnly && !seen.has(q)) {
      seen.add(q);
      downloads.push({
        quality:  q,
        label:    `${q} · MP4 · Video + Audio`,
        url:      videoOnly.url,
        audioUrl: audioStream ? audioStream.url : null,
        ext:      "mp4",
        hasAudio: false,
        type:     "video",
      });
    }
  }

  // Audio only
  if (audioStream) {
    downloads.push({
      quality:  "M4A",
      label:    "Audio Only · M4A",
      url:      audioStream.url,
      audioUrl: null,
      ext:      "m4a",
      hasAudio: true,
      type:     "audio",
    });
  }

  if (downloads.length === 0) return null;
  return { platform:"youtube", mediaType:"video", thumbnail, caption:title, duration, likeCount:0, downloads };
}

// ══════════════════════════════════════════
//  HEALTH
// ══════════════════════════════════════════
app.get("/health", (req, res) => {
  res.json({ success:true, status:"GrabReel server running", time:new Date().toISOString() });
});

// ══════════════════════════════════════════
//  INSTAGRAM
// ══════════════════════════════════════════
app.post("/api/download", dlLimiter, async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string")
    return res.status(400).json({ success:false, error:"Missing URL." });

  let cleanUrl;
  try {
    const p = new URL(url.trim());
    cleanUrl = `${p.origin}${p.pathname}`;
    if (!cleanUrl.endsWith("/")) cleanUrl += "/";
  } catch { return res.status(400).json({ success:false, error:"Invalid URL format." }); }

  if (!isValidInstagramUrl(cleanUrl))
    return res.status(400).json({ success:false, error:"Invalid Instagram URL." });

  const urlType = detectIGType(cleanUrl);

  try {
    const apiUrl = `https://${process.env.RAPIDAPI_HOST}/convert?url=${encodeURIComponent(cleanUrl)}`;
    console.log(`\n[IG] ${urlType.toUpperCase()} → ${cleanUrl}`);

    const r = await fetch(apiUrl, { method:"GET", headers:{ "x-rapidapi-key":process.env.RAPIDAPI_KEY, "x-rapidapi-host":process.env.RAPIDAPI_HOST } });
    const rawText = await r.text();
    console.log(`[IG] ${r.status} | ${rawText.slice(0,80)}`);

    if (!r.ok) {
      if (r.status === 404) return res.status(404).json({ success:false, error:"Media not found. Post may be private." });
      if (r.status === 429) return res.status(429).json({ success:false, error:"Rate limit reached." });
      return res.status(502).json({ success:false, error:`API error (${r.status}).` });
    }

    const data       = JSON.parse(rawText);
    const normalized = normalizeInstagram(data, urlType);
    if (!normalized) return res.status(422).json({ success:false, error:"Could not extract media." });

    console.log(`[IG] ✅ ${normalized.downloads.length} file(s)`);
    return res.status(200).json({ success:true, ...normalized });
  } catch (err) {
    console.error("[IG Error]", err.message);
    return res.status(500).json({ success:false, error:"Server error." });
  }
});

// ══════════════════════════════════════════
//  YOUTUBE
// ══════════════════════════════════════════
app.post("/api/youtube", dlLimiter, async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string")
    return res.status(400).json({ success:false, error:"Missing URL." });

  if (!isValidYouTubeUrl(url.trim()))
    return res.status(400).json({ success:false, error:"Invalid YouTube URL." });

  const videoId = extractYouTubeId(url.trim());
  if (!videoId)
    return res.status(400).json({ success:false, error:"Could not extract video ID." });

  try {
    const YT_HOST = process.env.RAPIDAPI_YT_HOST || "youtube-video-and-shorts-downloader.p.rapidapi.com";
    const apiUrl  = `https://${YT_HOST}/download.php?id=${videoId}`;
    console.log(`\n[YT] ID: ${videoId}`);

    const r = await fetch(apiUrl, { method:"GET", headers:{ "x-rapidapi-key":process.env.RAPIDAPI_KEY, "x-rapidapi-host":YT_HOST } });
    const rawText = await r.text();
    console.log(`[YT] ${r.status} | ${rawText.slice(0,80)}`);

    if (!r.ok) {
      if (r.status === 404) return res.status(404).json({ success:false, error:"Video not found." });
      if (r.status === 429) return res.status(429).json({ success:false, error:"Rate limit reached." });
      return res.status(502).json({ success:false, error:`API error (${r.status}).` });
    }

    const data = JSON.parse(rawText);
    if (data.status !== "ok") return res.status(422).json({ success:false, error:data.message||"Video unavailable." });

    const normalized = normalizeYouTube(data);
    if (!normalized) return res.status(422).json({ success:false, error:"Could not extract links." });

    console.log(`[YT] ✅ "${normalized.caption.slice(0,40)}" — ${normalized.downloads.length} formats`);
    return res.status(200).json({ success:true, ...normalized });
  } catch (err) {
    console.error("[YT Error]", err.message);
    return res.status(500).json({ success:false, error:"Server error." });
  }
});

// ══════════════════════════════════════════
//  PROXY — streams media directly to browser
//  Works for both Instagram CDN and YouTube
//  GET /api/proxy?url=...&filename=...
// ══════════════════════════════════════════
app.get("/api/proxy", async (req, res) => {
  const { url, filename } = req.query;
  if (!url) return res.status(400).json({ error:"Missing url" });

  try {
    const decoded = decodeURIComponent(url);

    // Choose headers based on source
    const isYouTube = decoded.includes("googlevideo.com");
    const headers   = isYouTube
      ? {
          "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept":          "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "identity",
          "Connection":      "keep-alive",
          "Referer":         "https://www.youtube.com/",
          "Origin":          "https://www.youtube.com",
          "Sec-Fetch-Dest":  "video",
          "Sec-Fetch-Mode":  "cors",
          "Sec-Fetch-Site":  "cross-site",
          ...(req.headers["range"] ? { "Range": req.headers["range"] } : {}),
        }
      : {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept":     "*/*",
          "Accept-Encoding": "identity",
        };

    const response = await fetch(decoded, { headers });
    console.log(`[Proxy] ${isYouTube?"YT":"IG"} → ${response.status}`);

    if (!response.ok && response.status !== 206) {
      return res.status(response.status).json({ error:`Upstream returned ${response.status}` });
    }

    const ct  = response.headers.get("content-type")   || (isYouTube ? "video/mp4" : "application/octet-stream");
    const cl  = response.headers.get("content-length");
    const cr  = response.headers.get("content-range");

    res.setHeader("Content-Disposition", `attachment; filename="${filename || "grabreel.mp4"}"`);
    res.setHeader("Content-Type", ct);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    if (cl) res.setHeader("Content-Length", cl);
    if (cr) res.setHeader("Content-Range", cr);
    if (response.status === 206) res.status(206);

    response.body.pipe(res);
    response.body.on("error", err => { console.error("[Proxy stream error]", err.message); });

  } catch (err) {
    console.error("[Proxy Error]", err.message);
    if (!res.headersSent) res.status(500).json({ error:"Proxy error: " + err.message });
  }
});

// ── 404 & errors ──────────────────────────
app.use((req, res) => res.status(404).json({ success:false, error:`${req.method} ${req.path} not found.` }));
app.use((err, req, res, next) => {
  if (err.message?.startsWith("CORS")) return res.status(403).json({ success:false, error:err.message });
  res.status(500).json({ success:false, error:"Internal server error." });
});

app.listen(PORT, () => {
  console.log(`\nGrabReel server → http://localhost:${PORT}`);
  console.log(`Health check   → http://localhost:${PORT}/health\n`);
});
