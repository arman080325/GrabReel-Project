// ═══════════════════════════════════════════════
//  GrabReel – Frontend Logic
// ═══════════════════════════════════════════════

// Change this to your Render URL after deploying
const BACKEND_URL = 'http://localhost:5000';

// ── TAB SWITCH ──────────────────────────────────
function setTab(el, type) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const placeholders = {
    reel:  'Paste Instagram Reel URL…',
    post:  'Paste Instagram Post URL…',
    story: 'Paste Instagram Story URL…',
  };
  document.getElementById('urlInput').placeholder = placeholders[type];
  hideAll();
}

// ── PASTE FROM CLIPBOARD ────────────────────────
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('urlInput').value = text;
    showToast('📋 Pasted from clipboard!');
  } catch {
    showToast('⚠️ Allow clipboard permission first');
  }
}

// ── VALIDATE URL (client-side pre-check) ────────
function isValidInstagramUrl(url) {
  return /instagram\.com\/(p|reel|stories|tv)\/[A-Za-z0-9_-]+/.test(url);
}

// ── HIDE ALL STATE PANELS ────────────────────────
function hideAll() {
  document.getElementById('loading').classList.remove('show');
  document.getElementById('errorBox').classList.remove('show');
  document.getElementById('result').classList.remove('show');
}

// ── SHOW ERROR ───────────────────────────────────
function showError(msg) {
  const box = document.getElementById('errorBox');
  box.querySelector('.error-text').innerHTML = msg;
  box.classList.add('show');
}

// ── MAIN DOWNLOAD HANDLER ────────────────────────
async function handleDownload() {
  const url = document.getElementById('urlInput').value.trim();
  hideAll();

  if (!url) {
    showToast('⚠️ Please paste an Instagram URL first');
    return;
  }

  if (!isValidInstagramUrl(url)) {
    showError('<strong>Invalid URL</strong> — Please paste a valid Instagram post or reel link.');
    return;
  }

  // Show loading
  document.getElementById('loading').classList.add('show');
  document.getElementById('mainBtn').disabled = true;

  try {
    const response = await fetch(`${BACKEND_URL}/api/download`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showError(`<strong>Error</strong> — ${data.error || 'Something went wrong. Please try again.'}`);
      return;
    }

    showResult(data);

  } catch (err) {
    console.error('Fetch error:', err);
    showError('<strong>Network error</strong> — Could not reach the server. Is the backend running?');
  } finally {
    document.getElementById('loading').classList.remove('show');
    document.getElementById('mainBtn').disabled = false;
  }
}

// ── RENDER RESULT CARD ───────────────────────────
function showResult(data) {
  const { mediaType, caption, thumbnail, downloads, likeCount, duration } = data;

  // Update preview header
  const typeEmoji = { video: '🎬', image: '🖼', carousel: '🎠' };
  document.getElementById('thumbWrap').innerHTML = thumbnail
    ? `<img src="${thumbnail}" alt="thumbnail" onerror="this.parentElement.textContent='${typeEmoji[mediaType] || '📷'}'"/>`
    : typeEmoji[mediaType] || '📷';

  document.getElementById('previewTitle').textContent = caption.length > 60
    ? caption.slice(0, 60) + '…'
    : caption || 'Instagram Media';

  // Update meta tags
  const metaContainer = document.querySelector('.preview-meta');
  const typeLabel = { video: '📺 Video', image: '🖼 Image', carousel: '🎠 Carousel' }[mediaType] || '📷 Media';
  const durationLabel = duration ? `⏱ ${Math.round(duration)}s` : '';
  const likesLabel = likeCount ? `❤️ ${likeCount.toLocaleString()}` : '';
  metaContainer.innerHTML = [typeLabel, durationLabel, likesLabel, '✅ Ready']
    .filter(Boolean)
    .map(t => `<span class="meta-tag">${t}</span>`)
    .join('');

  // Render download buttons
  const grid = document.getElementById('qualityGrid');
  grid.innerHTML = downloads.map(dl => `
    <div class="quality-item">
      <div class="quality-left">
        <span class="quality-badge">${dl.quality}</span>
        <span class="quality-label">${dl.label}</span>
      </div>
      <button class="dl-small" onclick="triggerDownload('${dl.url}', '${dl.ext}')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Save
      </button>
    </div>
  `).join('');

  document.getElementById('result').classList.add('show');
}

// ── TRIGGER FILE DOWNLOAD ────────────────────────
function triggerDownload(url, ext) {
  if (!url) { showToast('⚠️ Download URL not available'); return; }
  const a = document.createElement('a');
  a.href     = url;
  a.download = `grabreel_${Date.now()}.${ext}`;
  a.target   = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('⬇️ Download started!');
}

// ── TOAST NOTIFICATION ───────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── ENTER KEY ────────────────────────────────────
document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleDownload();
});
