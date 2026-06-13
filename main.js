/* ── State ───────────────────────────────────────────── */
let allVideos = [];
let config    = { contactEmail: '', currencySymbol: '$' };
let activeVideo = null;

/* ── Boot ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', loadData);

async function loadData() {
  try {
    const res  = await fetch('videos.json?v=' + Date.now());
    const data = await res.json();
    config     = { ...config, ...data.config };
    allVideos  = data.videos || [];
    init();
  } catch (e) {
    console.error('Could not load videos.json:', e);
    document.getElementById('videoGrid').innerHTML =
      '<div class="empty-state"><h3>Could not load datasets</h3><p>Make sure videos.json is in the same folder.</p></div>';
  }
}

function init() {
  // Stats counter
  document.getElementById('statCount').textContent = allVideos.length;

  // Contact email links
  const email = config.contactEmail;
  setEmail('contactEmailDisplay', email);
  document.getElementById('contactMailto').href = 'mailto:' + email;

  // Build filter buttons
  buildFilters();

  // Render all cards
  renderCards(allVideos);
}

/* ── Filters ─────────────────────────────────────────── */
function buildFilters() {
  const bar = document.getElementById('filterBar');
  const cats = [...new Set(allVideos.map(v => v.category).filter(Boolean))];
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = cat;
    btn.dataset.cat = cat;
    btn.addEventListener('click', () => filterVideos(cat, btn));
    bar.appendChild(btn);
  });
}

function filterVideos(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = cat === 'all' ? allVideos : allVideos.filter(v => v.category === cat);
  renderCards(filtered);
}

/* ── Cards ───────────────────────────────────────────── */
function renderCards(videos) {
  const grid = document.getElementById('videoGrid');
  if (!videos.length) {
    grid.innerHTML = '<div class="empty-state"><h3>No datasets found</h3><p>Try a different filter or check back soon.</p></div>';
    return;
  }
  grid.innerHTML = videos.map(v => cardHTML(v)).join('');
}

function cardHTML(v) {
  const price   = config.currencySymbol + Number(v.price).toFixed(2);
  const thumb   = v.thumbnailUrl || 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&auto=format';
  const catSlug = (v.category || '').toLowerCase().replace(/\s+/g, '-');

  return `
  <div class="video-card" data-id="${v.id}">
    <div class="thumb-wrap">
      <img src="${thumb}" alt="${escHtml(v.title)}" loading="lazy">
      <span class="price-badge">${price}</span>
      ${v.resolution ? `<span class="res-tag">${v.resolution}</span>` : ''}
    </div>
    <div class="card-body">
      <p class="card-cat">${escHtml(v.category || 'Dataset')}</p>
      <h3 class="card-title">${escHtml(v.title)}</h3>
      <p class="card-desc">${escHtml(v.description || '')}</p>
      <div class="card-stats">
        ${v.duration  ? `<div class="card-stat"><span class="card-stat-val">${v.duration}</span><span class="card-stat-key">Duration</span></div>` : ''}
        ${v.frames    ? `<div class="card-stat"><span class="card-stat-val">${v.frames}</span><span class="card-stat-key">Frames</span></div>` : ''}
        ${v.resolution? `<div class="card-stat"><span class="card-stat-val">${v.resolution}</span><span class="card-stat-key">Resolution</span></div>` : ''}
      </div>
    </div>
    <div class="card-foot">
      <span class="card-price">${price}</span>
      <button class="card-buy" onclick="openModal('${v.id}')">Purchase →</button>
    </div>
  </div>`;
}

/* ── Modal ───────────────────────────────────────────── */
function openModal(id) {
  const v = allVideos.find(x => x.id === id);
  if (!v) return;
  activeVideo = v;

  const price   = config.currencySymbol + Number(v.price).toFixed(2);
  const subject = encodeURIComponent('Purchase: ' + v.title);
  const body    = encodeURIComponent(`Hi,\n\nI'd like to purchase the dataset: "${v.title}" (${price}).\n\nPlease send me payment and download instructions.\n\nThank you!`);
  const mailto  = `mailto:${config.contactEmail}?subject=${subject}&body=${body}`;

  document.getElementById('modalTitle').textContent    = v.title;
  document.getElementById('modalPrice').textContent    = price;
  document.getElementById('modalCat').textContent      = v.category || '';
  document.getElementById('modalEmail').textContent    = config.contactEmail;
  document.getElementById('modalMailto').href          = mailto;
  document.getElementById('modalTitleHint').textContent = '"' + v.title + '"';
  document.getElementById('copyBtn').textContent       = 'Copy';
  document.getElementById('copyBtn').classList.remove('copied');

  // Meta info
  const metaParts = [];
  if (v.resolution) metaParts.push(v.resolution);
  if (v.duration)   metaParts.push(v.duration);
  if (v.frames)     metaParts.push(v.frames + ' frames');
  document.getElementById('modalMeta').innerHTML = metaParts.map(m =>
    `<span class="modal-meta-item">${escHtml(m)}</span>`).join('');

  document.getElementById('overlay').classList.add('open');
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
  activeVideo = null;
}

/* ── Copy email ──────────────────────────────────────── */
function copyEmail() {
  const btn = document.getElementById('copyBtn');
  navigator.clipboard.writeText(config.contactEmail).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}

/* ── Helpers ─────────────────────────────────────────── */
function setEmail(id, email) {
  const el = document.getElementById(id);
  if (el) el.textContent = email;
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Close modal on Escape key
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Scroll header shadow
window.addEventListener('scroll', () => {
  document.getElementById('header').style.boxShadow =
    window.scrollY > 10 ? '0 1px 24px rgba(4,4,12,.7)' : 'none';
});
