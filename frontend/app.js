// ── TAB SWITCH ──
function setTab(el, type) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const ph = {
    reel:  'Paste Instagram Reel URL…',
    post:  'Paste Instagram Post URL…',
    story: 'Paste Instagram Story URL…'
  };
  document.getElementById('urlInput').placeholder = ph[type];
  hideAll();
}

// ── PASTE FROM CLIPBOARD ──
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('urlInput').value = text;
    showToast('📋 Pasted from clipboard!');
  } catch {
    showToast('⚠️ Allow clipboard permission first');
  }
}

// ── VALIDATE INSTAGRAM URL ──
function isValidInstagramUrl(url) {
  return /instagram\.com\/(p|reel|stories|tv)\/[A-Za-z0-9_\-]+/.test(url);
}

// ── HIDE ALL STATES ──
function hideAll() {
  document.getElementById('loading').classList.remove('show');
  document.getElementById('errorBox').classList.remove('show');
  document.getElementById('result').classList.remove('show');
}

// ── MAIN DOWNLOAD HANDLER (DEMO MODE) ──
// TODO: Replace setTimeout simulation with real fetch() call to backend API
function handleDownload() {
  const url = document.getElementById('urlInput').value.trim();
  hideAll();

  if (!url) {
    showToast('⚠️ Please paste an Instagram URL first');
    return;
  }

  if (!isValidInstagramUrl(url)) {
    document.getElementById('errorBox').classList.add('show');
    return;
  }

  // Show loading state
  document.getElementById('loading').classList.add('show');
  document.getElementById('mainBtn').disabled = true;

  // Simulate API call — replace with real backend fetch later:
  // fetch('/api/download', { method: 'POST', body: JSON.stringify({ url }) })
  setTimeout(() => {
    document.getElementById('loading').classList.remove('show');
    document.getElementById('mainBtn').disabled = false;
    showResult(url);
  }, 1800);
}

// ── SHOW RESULT ──
function showResult(url) {
  const isReel = url.includes('/reel/');

  const qualities = isReel
    ? [
        { label: 'HD  1080p', desc: 'Full HD · MP4',       size: '~18 MB' },
        { label: 'SD  720p',  desc: 'Standard · MP4',      size: '~9 MB'  },
        { label: 'Audio',     desc: 'MP3 only · 128kbps',  size: '~3 MB'  },
      ]
    : [
        { label: 'Original',   desc: 'Full resolution · JPG', size: '~4 MB'   },
        { label: 'Compressed', desc: 'Optimised · JPG',        size: '~1.2 MB' },
      ];

  document.getElementById('previewTitle').textContent = isReel ? 'Instagram Reel' : 'Instagram Post';
  document.getElementById('thumbWrap').textContent    = isReel ? '🎬' : '🖼';

  const grid = document.getElementById('qualityGrid');
  grid.innerHTML = qualities.map(q => `
    <div class="quality-item">
      <div class="quality-left">
        <span class="quality-badge">${q.label}</span>
        <span class="quality-label">${q.desc}</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="quality-size">${q.size}</span>
        <button class="dl-small" onclick="showToast('⬇ Download started!')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Save
        </button>
      </div>
    </div>
  `).join('');

  document.getElementById('result').classList.add('show');
}

// ── TOAST NOTIFICATION ──
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── ENTER KEY SUPPORT ──
document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleDownload();
});
