// ═══════════════════════════════════════════════
//  GrabReel v3 — Instagram + YouTube Downloader
// ═══════════════════════════════════════════════

const BACKEND_URL = 'http://localhost:5000';

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

  document.getElementById('igTabs').style.display  = platform === 'instagram' ? 'flex' : 'none';
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

// ── IG TABS ───────────────────────────────────────
function setTab(el, type) {
  document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const ph = { reel:'https://www.instagram.com/reel/...', post:'https://www.instagram.com/p/...', story:'https://www.instagram.com/stories/...' };
  document.getElementById('urlInput').placeholder = ph[type];
  hideAll();
}

// ── PASTE ────────────────────────────────────────
async function pasteURL() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('urlInput').value = text;
    if (/youtube\.com|youtu\.be/.test(text)) setPlatform('youtube');
    else if (/instagram\.com/.test(text))     setPlatform('instagram');
    showToast('Pasted from clipboard');
  } catch { showToast('Allow clipboard permission first'); }
}

// ── HIDE ALL ─────────────────────────────────────
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

// ── MAIN HANDLER ─────────────────────────────────
async function handleDownload() {
  const url = document.getElementById('urlInput').value.trim();
  hideAll();
  if (!url) { showToast('Paste a URL first'); return; }
  if (currentPlatform === 'instagram') {
    if (!isValidInstagramUrl(url)) { showError('Invalid Instagram URL.'); return; }
    await fetchInstagram(url);
  } else {
    if (!isValidYouTubeUrl(url)) { showError('Invalid YouTube URL.'); return; }
    await fetchYouTube(url);
  }
}

async function fetchInstagram(url) {
  document.getElementById('loading').classList.add('show');
  document.getElementById('fetchBtn').disabled = true;
  try {
    const res  = await fetch(`${BACKEND_URL}/api/download`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) { showError(data.error || 'Something went wrong.'); return; }
    renderResult(data);
  } catch { showError('Network error — is the backend running?'); }
  finally {
    document.getElementById('loading').classList.remove('show');
    document.getElementById('fetchBtn').disabled = false;
  }
}

async function fetchYouTube(url) {
  document.getElementById('loading').classList.add('show');
  document.getElementById('fetchBtn').disabled = true;
  try {
    const res  = await fetch(`${BACKEND_URL}/api/youtube`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
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
    previewArea.innerHTML = `
      <div style="position:relative;width:100%;cursor:pointer;" onclick="window.open('https://www.youtube.com/watch?v=${extractYTId(document.getElementById('urlInput').value)}','_blank')">
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
      const video = document.createElement('video');
      video.src = dl.url; video.controls = true; video.poster = thumbnail || '';
      video.style.cssText = 'width:100%;max-height:480px;background:#000;';
      previewArea.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = dl.url || thumbnail; img.alt = 'media';
      previewArea.appendChild(img);
    }
  } else if (downloads.length > 1) {
    const wrap = document.createElement('div'); wrap.className = 'carousel-wrap';
    const track = document.createElement('div'); track.className = 'carousel-track';
    downloads.forEach((dl, i) => {
      const slide = document.createElement('div'); slide.className = 'carousel-slide';
      if (dl.ext === 'mp4') {
        const v = document.createElement('video'); v.src = dl.url; v.controls = true; slide.appendChild(v);
      } else {
        const img = document.createElement('img'); img.src = dl.url; img.alt = `Slide ${i+1}`; slide.appendChild(img);
      }
      track.appendChild(slide);
    });
    const nav = document.createElement('div'); nav.className = 'carousel-nav';
    downloads.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i===0?' active':'');
      dot.onclick = () => {
        track.scrollTo({ left: i*track.clientWidth, behavior:'smooth' });
        document.querySelectorAll('.carousel-dot').forEach((d,j) => d.classList.toggle('active', j===i));
      };
      nav.appendChild(dot);
    });
    wrap.appendChild(track); wrap.appendChild(nav); previewArea.appendChild(wrap);
  }

  const typeLabels = { video:'VIDEO', image:'IMAGE', carousel:'CAROUSEL' };
  document.getElementById('mediaTypeBadge').textContent = typeLabels[mediaType] || 'MEDIA';
  document.getElementById('mediaCaption').textContent   = (caption || 'Instagram Media').slice(0, 120);

  const meta = [];
  if (duration)  meta.push(platform === 'youtube' ? `⏱ ${formatDuration(duration)}` : `⏱ ${Math.round(duration)}s`);
  if (likeCount) meta.push(`❤ ${likeCount.toLocaleString()}`);
  meta.push(`${downloads.length} format${downloads.length > 1 ? 's' : ''} available`);
  document.getElementById('mediaMeta').textContent = meta.join('  ·  ');

  const list = document.getElementById('downloadList');
  list.innerHTML = downloads.map((dl, i) => `
    <div class="dl-item${dl.hasAudio === false ? ' dl-no-audio' : ''}">
      <div class="dl-left">
        <span class="dl-badge">${dl.quality}</span>
        <span class="dl-label">${dl.label}</span>
        ${dl.hasAudio === false ? '<span class="dl-audio-badge">VIDEO ONLY</span>' : ''}
      </div>
      <button class="dl-save-btn" onclick="triggerDownload('${encodeURIComponent(dl.url)}','${dl.ext}',${i},'${platform}')">
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

// ── EXTRACT YT ID ────────────────────────────────
function extractYTId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

// ── FORMAT DURATION ──────────────────────────────
function formatDuration(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = Math.floor(s%60);
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    : `${m}:${String(sec).padStart(2,'0')}`;
}

// ══════════════════════════════════════════════════
//  DOWNLOAD HANDLER
//  Instagram  → blob fetch (works fine, no IP lock)
//  YouTube    → open direct googlevideo URL in new
//               tab; browser handles the download
// ══════════════════════════════════════════════════
async function triggerDownload(encodedUrl, ext, index, platform) {
  const url      = decodeURIComponent(encodedUrl);
  const filename = `grabreel_${Date.now()}_${index + 1}.${ext}`;

  if (platform === 'youtube') {
    // ── YouTube: open the direct stream URL in a new tab ──
    // The URL is a signed googlevideo.com link that the browser
    // can stream directly. Right-click → Save As, or it auto-downloads
    // depending on browser settings.
    showToast('Opening download link...');
    const a = document.createElement('a');
    a.href     = url;
    a.target   = '_blank';
    a.rel      = 'noopener noreferrer';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Show helper toast after 1.5s
    setTimeout(() => showToast('Right-click the video → Save As to download'), 1500);
    return;
  }

  // ── Instagram: blob download ──
  showToast('Download starting...');
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('fetch failed');
    const blob    = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    showToast('Download complete!');
  } catch {
    // Fallback
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.target = '_blank';
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
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── ENTER KEY ────────────────────────────────────
document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleDownload();
});

// Init
setPlatform('instagram');
