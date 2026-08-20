// ═══════════════════════════════════════════════
//  GrabReel v3 — Instagram + YouTube Downloader
// ═══════════════════════════════════════════════

const BACKEND_URL = 'https://grabmedia-backend.onrender.com';
let currentPlatform = 'instagram';

// ── CURSOR ───────────────────────────────────────
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
document.addEventListener('mousemove', e => {
  cursor.style.left    = e.clientX + 'px';
  cursor.style.top     = e.clientY + 'px';
  cursorDot.style.left = e.clientX + 'px';
  cursorDot.style.top  = e.clientY + 'px';
});

// ── PLATFORM SWITCH ──────────────────────────────
function setPlatform(platform) {
  currentPlatform = platform;
  document.body.classList.remove('ig-mode','yt-mode');
  document.body.classList.add(platform === 'youtube' ? 'yt-mode' : 'ig-mode');
  document.getElementById('btnIG').classList.toggle('active', platform === 'instagram');
  document.getElementById('btnYT').classList.toggle('active', platform === 'youtube');
  document.getElementById('igTabs').style.display = platform === 'instagram' ? 'flex' : 'none';
  document.getElementById('ytInfo').classList.toggle('show', platform === 'youtube');
  const ph = {
    instagram: 'https://www.instagram.com/reel/...',
    youtube:   'https://www.youtube.com/watch?v=... or youtu.be/...',
  };
  document.getElementById('urlInput').placeholder = ph[platform];
  document.getElementById('urlInput').value = '';
  document.getElementById('navPlatformTag').textContent =
    platform === 'youtube' ? 'YouTube Downloader' : 'Instagram Downloader';
  hideAll();
}

document.getElementById('urlInput').addEventListener('input', e => {
  const val = e.target.value.trim();
  if (/youtube\.com|youtu\.be/.test(val) && currentPlatform !== 'youtube') setPlatform('youtube');
  else if (/instagram\.com/.test(val) && currentPlatform !== 'instagram') setPlatform('instagram');
});

function setTab(el, type) {
  document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const ph = { reel:'https://www.instagram.com/reel/...', post:'https://www.instagram.com/p/...', story:'https://www.instagram.com/stories/...' };
  document.getElementById('urlInput').placeholder = ph[type];
  hideAll();
}

async function pasteURL() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('urlInput').value = text;
    if (/youtube\.com|youtu\.be/.test(text)) setPlatform('youtube');
    else if (/instagram\.com/.test(text))     setPlatform('instagram');
    showToast('Pasted from clipboard');
  } catch { showToast('Allow clipboard permission first'); }
}

function hideAll() {
  document.getElementById('loading').classList.remove('show');
  document.getElementById('errorBox').classList.remove('show');
  document.getElementById('result').classList.remove('show');
}

function showError(msg) {
  document.getElementById('errorMsg').textContent = msg;
  document.getElementById('errorBox').classList.add('show');
}

function isValidInstagramUrl(url) {
  return /instagram\.com\/(p|reel|stories|tv)\/[A-Za-z0-9_-]+/.test(url);
}
function isValidYouTubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[A-Za-z0-9_-]+/.test(url);
}
function extractYTId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}
function formatDuration(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = Math.floor(s%60);
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    : `${m}:${String(sec).padStart(2,'0')}`;
}

// ── MAIN HANDLER ─────────────────────────────────
async function handleDownload() {
  const url = document.getElementById('urlInput').value.trim();
  hideAll();
  if (!url) { showToast('Paste a URL first'); return; }
  if (currentPlatform === 'instagram') {
    if (!isValidInstagramUrl(url)) { showError('Invalid Instagram URL.'); return; }
    await doFetch(`${BACKEND_URL}/api/download`, url);
  } else {
    if (!isValidYouTubeUrl(url)) { showError('Invalid YouTube URL.'); return; }
    await doFetch(`${BACKEND_URL}/api/youtube`, url);
  }
}

async function doFetch(endpoint, url) {
  document.getElementById('loading').classList.add('show');
  document.getElementById('fetchBtn').disabled = true;
  try {
    const res  = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ url }) });
    const data = await res.json();
    if (!res.ok || !data.success) { showError(data.error || 'Something went wrong.'); return; }
    renderResult(data);
  } catch { showError('Network error — is the backend running?'); }
  finally {
    document.getElementById('loading').classList.remove('show');
    document.getElementById('fetchBtn').disabled = false;
  }
}

// ── RENDER RESULT ────────────────────────────────
function renderResult(data) {
  const { platform, mediaType, thumbnail, caption, downloads, likeCount, duration } = data;
  document.body.classList.remove('ig-mode','yt-mode');
  document.body.classList.add(platform === 'youtube' ? 'yt-mode' : 'ig-mode');

  const previewArea = document.getElementById('previewArea');
  previewArea.innerHTML = '';

  if (platform === 'youtube') {
    const ytId = extractYTId(document.getElementById('urlInput').value);
    previewArea.innerHTML = `
      <div style="position:relative;width:100%;cursor:pointer;" onclick="window.open('https://www.youtube.com/watch?v=${ytId}','_blank')">
        <img src="${thumbnail}" alt="thumbnail" style="width:100%;max-height:400px;object-fit:cover;display:block;"/>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);">
          <div style="width:64px;height:64px;background:rgba(255,0,0,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
        ${duration ? `<div style="position:absolute;bottom:12px;right:12px;background:rgba(0,0,0,0.85);color:#fff;font-family:monospace;font-size:0.75rem;padding:3px 8px;border-radius:2px;">${formatDuration(duration)}</div>` : ''}
      </div>`;
  } else if (downloads.length === 1) {
    const dl = downloads[0];
    if (dl.ext === 'mp4') {
      const v = document.createElement('video');
      v.src = dl.url; v.controls = true; v.poster = thumbnail || '';
      v.style.cssText = 'width:100%;max-height:480px;background:#000;';
      previewArea.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = dl.url || thumbnail; img.alt = 'media';
      previewArea.appendChild(img);
    }
  } else if (downloads.length > 1 && platform === 'instagram') {
    const wrap  = document.createElement('div'); wrap.className = 'carousel-wrap';
    const track = document.createElement('div'); track.className = 'carousel-track';
    downloads.forEach((dl, i) => {
      const slide = document.createElement('div'); slide.className = 'carousel-slide';
      if (dl.ext === 'mp4') { const v=document.createElement('video'); v.src=dl.url; v.controls=true; slide.appendChild(v); }
      else { const img=document.createElement('img'); img.src=dl.url; img.alt=`Slide ${i+1}`; slide.appendChild(img); }
      track.appendChild(slide);
    });
    const nav = document.createElement('div'); nav.className = 'carousel-nav';
    downloads.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i===0?' active':'');
      dot.onclick = () => { track.scrollTo({left:i*track.clientWidth,behavior:'smooth'}); document.querySelectorAll('.carousel-dot').forEach((d,j)=>d.classList.toggle('active',j===i)); };
      nav.appendChild(dot);
    });
    wrap.appendChild(track); wrap.appendChild(nav); previewArea.appendChild(wrap);
  }

  const typeLabels = { video:'VIDEO', image:'IMAGE', carousel:'CAROUSEL' };
  document.getElementById('mediaTypeBadge').textContent = typeLabels[mediaType] || 'MEDIA';
  document.getElementById('mediaCaption').textContent   = (caption||'Media').slice(0,120);

  const meta = [];
  if (duration)  meta.push(platform === 'youtube' ? `⏱ ${formatDuration(duration)}` : `⏱ ${Math.round(duration)}s`);
  if (likeCount) meta.push(`❤ ${likeCount.toLocaleString()}`);
  meta.push(`${downloads.length} format${downloads.length>1?'s':''} available`);
  document.getElementById('mediaMeta').textContent = meta.join('  ·  ');

  const list = document.getElementById('downloadList');
  list.innerHTML = downloads.map((dl, i) => `
    <div class="dl-item">
      <div class="dl-left">
        <span class="dl-badge">${dl.quality}</span>
        <span class="dl-label">${dl.label}</span>
      </div>
      <button class="dl-save-btn" onclick="triggerDownload('${encodeURIComponent(dl.url)}','${dl.audioUrl ? encodeURIComponent(dl.audioUrl) : ''}','${dl.ext}',${i},'${platform}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        SAVE
      </button>
    </div>
  `).join('');

  document.getElementById('result').classList.add('show');
  setTimeout(() => document.getElementById('result').scrollIntoView({ behavior:'smooth', block:'start' }), 100);
}

// ══════════════════════════════════════════════════
//  DOWNLOAD HANDLER
//  Streams both video + audio via backend proxy
// ══════════════════════════════════════════════════
async function triggerDownload(encodedVideoUrl, encodedAudioUrl, ext, index, platform) {
  const videoUrl = decodeURIComponent(encodedVideoUrl);
  const audioUrl = encodedAudioUrl ? decodeURIComponent(encodedAudioUrl) : null;
  const filename = `grabreel_${Date.now()}_${index+1}.${ext}`;

  showToast('Starting download...');

  if (platform === 'youtube') {
    // Use backend proxy which sends correct headers for googlevideo
    const proxyUrl = `${BACKEND_URL}/api/proxy?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`;

    try {
      const a = document.createElement('a');
      a.href = proxyUrl;
      document.body.appendChild(a); 
      a.click();
      document.body.removeChild(a);
      showToast('Download started! 🎉');

      // If there's a separate audio stream, download it too
      if (audioUrl && ext === 'mp4') {
        setTimeout(() => {
          const audioFilename = `grabreel_${Date.now()}_audio.m4a`;
          const audioProxyUrl = `${BACKEND_URL}/api/proxy?url=${encodeURIComponent(audioUrl)}&filename=${encodeURIComponent(audioFilename)}`;
          const a2 = document.createElement('a');
          a2.href = audioProxyUrl;
          document.body.appendChild(a2); 
          a2.click();
          document.body.removeChild(a2);
          showToast('Audio track also downloading! Merge with any video editor.');
        }, 1500);
      }
    } catch {
      // Final fallback — open in new tab
      showToast('Opening download link...');
      window.open(videoUrl, '_blank');
    }
    return;
  }

  // ── Instagram — use proxy for direct download to avoid CORS/Blob issues ──
  try {
    const proxyUrl = `${BACKEND_URL}/api/proxy?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = proxyUrl;
    document.body.appendChild(a); 
    a.click();
    document.body.removeChild(a);
    showToast('Download started! 🎉');
  } catch {
    const a = document.createElement('a');
    a.href = videoUrl; a.target = '_blank';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    showToast('Opened in new tab — Save As to download');
  }
}

// ── TOAST ────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleDownload();
});

setPlatform('instagram');

// ═══════════════════════════════════════════════
//  TIME-BASED DARK / LIGHT MODE
//  Day   = 06:00 – 18:59 → light mode
//  Night = 19:00 – 05:59 → dark mode
// ═══════════════════════════════════════════════

const LIGHT_START = 6;   // 6 AM
const LIGHT_END   = 19;  // 7 PM

let userOverride = null;  // null = auto, 'light' or 'dark' = manual

function isDaytime() {
  const h = new Date().getHours();
  return h >= LIGHT_START && h < LIGHT_END;
}

function applyMode(isLight) {
  const body      = document.body;
  const icon      = document.getElementById('modeIcon');
  const label     = document.getElementById('modeLabel');

  if (isLight) {
    body.classList.add('light-mode');
    if (icon)  icon.textContent  = '☀️';
    if (label) label.textContent = 'LIGHT MODE';
  } else {
    body.classList.remove('light-mode');
    if (icon)  icon.textContent  = '🌙';
    if (label) label.textContent = 'DARK MODE';
  }

  
}


function toggleMode() {
  const isCurrentlyLight = document.body.classList.contains('light-mode');
  userOverride = isCurrentlyLight ? 'dark' : 'light';
  applyMode(!isCurrentlyLight);

  // Store override in sessionStorage so it persists on refresh within session
  sessionStorage.setItem('grabreel_mode', userOverride);
}

function initMode() {
  // Check for session override first
  const stored = sessionStorage.getItem('grabreel_mode');
  if (stored) {
    userOverride = stored;
    applyMode(stored === 'light');
    return;
  }

  // Auto mode based on time
  applyMode(isDaytime());
}

// Check every minute if mode needs to auto-switch
function scheduleAutoSwitch() {
  setInterval(() => {
    if (userOverride) return;  // User has manually set mode, don't override

    const shouldBeLight = isDaytime();
    const isLight       = document.body.classList.contains('light-mode');

    if (shouldBeLight !== isLight) {
      applyMode(shouldBeLight);
    }
  }, 60 * 1000);
}

// ── Init on page load ──
initMode();
scheduleAutoSwitch();

// Update the clock display in the nav every minute
setInterval(() => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const navTag  = document.getElementById('navPlatformTag');
  // Only show time if not showing platform name actively
}, 60000);
