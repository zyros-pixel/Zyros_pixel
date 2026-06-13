/* ────────────────────────────────────────────────────────
   ZYROS PIXEL — Admin Panel
   ─────────────────────────────────────────────────────────
   ⚠  CHANGE THIS PASSWORD before deploying!
      Open admin.js and update ADMIN_PASSWORD below.
      Keep your GitHub repo private for extra security.
   ──────────────────────────────────────────────────────── */
const ADMIN_PASSWORD = 'ZyrosPixel2025';

/* ── State ───────────────────────────────────────────── */
let videos  = [];
let config  = { contactEmail: '', currency: 'USD', currencySymbol: '$' };
let editId  = null;  // null = add mode, string = edit mode
let delId   = null;

/* ── Boot ────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('zpAdmin') === 'yes') {
    showDashboard();
    loadData();
  }
});

/* ── Auth ────────────────────────────────────────────── */
function doLogin() {
  const pw  = document.getElementById('pwInput').value;
  const err = document.getElementById('loginError');
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem('zpAdmin', 'yes');
    showDashboard();
    loadData();
  } else {
    err.textContent = 'Incorrect password. Please try again.';
    document.getElementById('pwInput').value = '';
    document.getElementById('pwInput').focus();
  }
}

function doLogout() {
  sessionStorage.removeItem('zpAdmin');
  location.reload();
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
}

/* ── Load data ───────────────────────────────────────── */
async function loadData() {
  // Try to load from localStorage first (unsaved admin changes), then videos.json
  const cached = localStorage.getItem('zpVideos');
  const cachedCfg = localStorage.getItem('zpConfig');

  try {
    const res  = await fetch('videos.json?v=' + Date.now());
    const data = await res.json();
    // Use cached data if it's newer (admin was editing)
    videos = cached ? JSON.parse(cached) : (data.videos || []);
    config = cachedCfg ? JSON.parse(cachedCfg) : { ...config, ...data.config };
  } catch (e) {
    // No videos.json yet — start fresh
    videos = cached ? JSON.parse(cached) : [];
    config = cachedCfg ? JSON.parse(cachedCfg) : config;
  }

  renderStats();
  renderTable();
  renderSettingsForm();
}

function saveToLocal() {
  localStorage.setItem('zpVideos', JSON.stringify(videos));
  localStorage.setItem('zpConfig', JSON.stringify(config));
}

/* ── Stats ───────────────────────────────────────────── */
function renderStats() {
  const cats  = [...new Set(videos.map(v => v.category).filter(Boolean))];
  const total = videos.reduce((s, v) => s + Number(v.price || 0), 0);
  document.getElementById('statsRow').innerHTML = `
    <div class="stat-chip"><span class="stat-chip-val">${videos.length}</span><span class="stat-chip-key">Total Videos</span></div>
    <div class="stat-chip"><span class="stat-chip-val">${cats.length}</span><span class="stat-chip-key">Categories</span></div>
    <div class="stat-chip"><span class="stat-chip-val">${config.currencySymbol}${total.toFixed(2)}</span><span class="stat-chip-key">Total Value</span></div>
  `;
}

/* ── Table ───────────────────────────────────────────── */
function renderTable() {
  const tbody = document.getElementById('vTableBody');
  if (!videos.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="tbl-empty">No videos yet. Click "+ Add Video" to get started.</td></tr>';
    return;
  }
  tbody.innerHTML = videos.map(v => {
    const price = config.currencySymbol + Number(v.price || 0).toFixed(2);
    const thumb = v.thumbnailUrl
      ? `<img class="tbl-thumb" src="${esc(v.thumbnailUrl)}" alt="" onerror="this.style.display='none'">`
      : `<div class="tbl-no-thumb">🎬</div>`;
    return `
    <tr>
      <td>${thumb}</td>
      <td><div class="tbl-title">${esc(v.title)}</div></td>
      <td><span class="tbl-cat">${esc(v.category || '—')}</span></td>
      <td>${esc(v.resolution || '—')}</td>
      <td class="tbl-price">${price}</td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn tbl-btn-edit" onclick="openEditModal('${v.id}')">Edit</button>
          <button class="tbl-btn tbl-btn-del"  onclick="openDelModal('${v.id}')">Delete</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ── Add / Edit Modal ────────────────────────────────── */
function openAddModal() {
  editId = null;
  document.getElementById('formModalTitle').textContent = 'Add Video';
  clearForm();
  openModal('formOverlay', 'formModal');
}

function openEditModal(id) {
  const v = videos.find(x => x.id === id);
  if (!v) return;
  editId = id;
  document.getElementById('formModalTitle').textContent = 'Edit Video';
  document.getElementById('fTitle').value  = v.title || '';
  document.getElementById('fDesc').value   = v.description || '';
  document.getElementById('fCat').value    = v.category || '';
  document.getElementById('fPrice').value  = v.price || '';
  document.getElementById('fRes').value    = v.resolution || '';
  document.getElementById('fDur').value    = v.duration || '';
  document.getElementById('fFrames').value = v.frames || '';
  document.getElementById('fThumb').value  = v.thumbnailUrl || '';
  document.getElementById('fTags').value   = (v.tags || []).join(', ');
  openModal('formOverlay', 'formModal');
}

function closeFormModal() {
  closeModal('formOverlay', 'formModal');
  clearForm();
  editId = null;
}

function clearForm() {
  ['fTitle','fDesc','fCat','fPrice','fRes','fDur','fFrames','fThumb','fTags']
    .forEach(id => document.getElementById(id).value = '');
}

function saveVideo() {
  const title = document.getElementById('fTitle').value.trim();
  const desc  = document.getElementById('fDesc').value.trim();
  const cat   = document.getElementById('fCat').value.trim();
  const price = parseFloat(document.getElementById('fPrice').value);

  if (!title || !desc || !cat || isNaN(price)) {
    alert('Please fill in Title, Description, Category, and Price.');
    return;
  }

  const tagsRaw = document.getElementById('fTags').value;
  const tags    = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

  const videoData = {
    title,
    description: desc,
    category:    cat,
    price,
    resolution:  document.getElementById('fRes').value.trim(),
    duration:    document.getElementById('fDur').value.trim(),
    frames:      document.getElementById('fFrames').value.trim(),
    thumbnailUrl:document.getElementById('fThumb').value.trim(),
    tags,
  };

  if (editId) {
    const idx = videos.findIndex(v => v.id === editId);
    if (idx > -1) videos[idx] = { ...videos[idx], ...videoData };
  } else {
    videoData.id = 'v' + Date.now();
    videos.push(videoData);
  }

  saveToLocal();
  renderStats();
  renderTable();
  closeFormModal();
}

/* ── Delete ──────────────────────────────────────────── */
function openDelModal(id) {
  const v = videos.find(x => x.id === id);
  if (!v) return;
  delId = id;
  document.getElementById('delTitle').textContent = v.title;
  openModal('delOverlay', 'delModal');
}

function closeDelModal() {
  closeModal('delOverlay', 'delModal');
  delId = null;
}

function confirmDelete() {
  videos = videos.filter(v => v.id !== delId);
  saveToLocal();
  renderStats();
  renderTable();
  closeDelModal();
}

/* ── Settings ────────────────────────────────────────── */
function renderSettingsForm() {
  document.getElementById('cfgEmail').value  = config.contactEmail || '';
  document.getElementById('cfgSymbol').value = config.currencySymbol || '$';
}

function saveSettings() {
  config.contactEmail  = document.getElementById('cfgEmail').value.trim();
  config.currencySymbol = document.getElementById('cfgSymbol').value.trim() || '$';
  saveToLocal();
  renderStats();
  const notice = document.getElementById('settingsSaved');
  notice.style.display = 'block';
  setTimeout(() => { notice.style.display = 'none'; }, 3000);
}

/* ── Export videos.json ──────────────────────────────── */
function exportJSON() {
  const data = { config, videos };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'videos.json';
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Tabs ────────────────────────────────────────────── */
function showTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.snav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.remove('hidden');
  btn.classList.add('active');
  return false;
}

/* ── Modal helpers ───────────────────────────────────── */
function openModal(overlayId, modalId) {
  document.getElementById(overlayId).classList.add('open');
  document.getElementById(modalId).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(overlayId, modalId) {
  document.getElementById(overlayId).classList.remove('open');
  document.getElementById(modalId).classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeFormModal();
    closeDelModal();
  }
});

/* ── Escape helper ───────────────────────────────────── */
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
