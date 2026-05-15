/* ==========================================================
   NOVA — Designer Portfolio + Shop Logic
   ========================================================== */

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');
if (toggle) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') links.classList.remove('open');
  });
}

/* ---------- Reveal-on-scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

const observe = (el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  io.observe(el);
};
document.querySelectorAll('.card, .project, .section-head, .about-text, .contact-card, .shop-toolbar')
  .forEach(observe);

/* ---------- Hero parallax orb ---------- */
const orb = document.querySelector('.orb');
if (orb) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    orb.style.translate = `${x}px ${y}px`;
  });
}

/* ==========================================================
   SHOP — Data & State
   ========================================================== */

/* Each product:
   id, title, desc, category, type ('static' | 'animated'),
   price (hearts), ratio (CSS aspect-ratio), gradient (preview bg) */
const PRODUCTS = [
  // ---------- Thumbnails (16:9) ----------
  {
    id: 'th-01', title: 'Gaming Thumbnail · Neon',
    desc: 'Thumbnail YouTube tone neon dành cho gaming channel. PSD + Figma.',
    category: 'thumbnail', type: 'static', price: 80, ratio: '16/9',
    gradient: 'linear-gradient(135deg, #ff2e63 0%, #7c5cff 50%, #08d9d6 100%)',
    icon: '▶', tag: 'YT Gaming'
  },
  {
    id: 'th-02', title: 'Vlog Thumbnail · Cinematic',
    desc: 'Layout cinematic cho vlog du lịch — gradient mềm, typo lớn.',
    category: 'thumbnail', type: 'static', price: 70, ratio: '16/9',
    gradient: 'linear-gradient(135deg, #ffb56b 0%, #ff5edb 100%)',
    icon: '✈', tag: 'Vlog'
  },
  {
    id: 'th-03', title: 'Animated Thumbnail · Motion',
    desc: 'Thumbnail có animation glow & particle — chuẩn cho video editor.',
    category: 'thumbnail', type: 'animated', price: 150, ratio: '16/9',
    gradient: 'linear-gradient(135deg, #00f5a0, #00d9f5, #7c5cff)',
    icon: '✦', tag: 'Motion'
  },

  // ---------- Logos (1:1) ----------
  {
    id: 'lg-01', title: 'Minimal Logo · Mono',
    desc: 'Logo monogram tối giản, vector SVG + AI.',
    category: 'logo', type: 'static', price: 120, ratio: '1/1',
    gradient: 'linear-gradient(135deg, #1a1a2e, #4dd0ff 200%)',
    icon: 'N', tag: 'Mono'
  },
  {
    id: 'lg-02', title: 'Animated Logo · Reveal',
    desc: 'Logo có animation reveal cho intro video. Lottie + MP4.',
    category: 'logo', type: 'animated', price: 220, ratio: '1/1',
    gradient: 'linear-gradient(135deg, #7c5cff, #ff5edb)',
    icon: '✦', tag: 'Lottie'
  },
  {
    id: 'lg-03', title: 'Esport Logo · Mascot',
    desc: 'Logo mascot thiết kế cho team esport, file vector chỉnh sửa.',
    category: 'logo', type: 'static', price: 180, ratio: '1/1',
    gradient: 'linear-gradient(135deg, #ff2e63, #ffd166)',
    icon: '⚔', tag: 'Esport'
  },

  // ---------- Shop Banners (5:2 — wide) ----------
  {
    id: 'bs-01', title: 'Shopee Banner · Sale',
    desc: 'Banner sale flash cho shop Shopee/Lazada, nhiều layout.',
    category: 'banner-shop', type: 'static', price: 100, ratio: '5/2',
    gradient: 'linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)',
    icon: '🛍', tag: 'Sale'
  },
  {
    id: 'bs-02', title: 'Shop Banner · Animated GIF',
    desc: 'Banner shop động dạng GIF, phù hợp marketplace.',
    category: 'banner-shop', type: 'animated', price: 180, ratio: '5/2',
    gradient: 'linear-gradient(135deg, #2bf2c0, #4dd0ff, #7c5cff)',
    icon: '⚡', tag: 'GIF'
  },

  // ---------- YouTube Banners (16:9 — channel art) ----------
  {
    id: 'yt-01', title: 'YouTube Banner · Tech',
    desc: 'Channel art cho kênh tech/review, 2560x1440 chuẩn YT.',
    category: 'banner-youtube', type: 'static', price: 120, ratio: '16/9',
    gradient: 'linear-gradient(135deg, #0f2027, #2c5364, #00d9f5)',
    icon: '▶', tag: 'Tech'
  },
  {
    id: 'yt-02', title: 'YouTube Banner · Animated',
    desc: 'Banner YT có hiệu ứng động export MP4 cho intro stream.',
    category: 'banner-youtube', type: 'animated', price: 200, ratio: '16/9',
    gradient: 'linear-gradient(135deg, #ff2e63, #7c5cff, #08d9d6)',
    icon: '✦', tag: 'Motion'
  },

  // ---------- Discord Banners (3:1) ----------
  {
    id: 'dc-01', title: 'Discord Banner · Aesthetic',
    desc: 'Banner server Discord aesthetic — soft purple tone.',
    category: 'banner-discord', type: 'static', price: 90, ratio: '3/1',
    gradient: 'linear-gradient(135deg, #5865f2, #7c5cff, #ff5edb)',
    icon: '#', tag: 'Aesthetic'
  },
  {
    id: 'dc-02', title: 'Discord Banner · Live',
    desc: 'Banner động cho server Discord, đổi gradient liên tục.',
    category: 'banner-discord', type: 'animated', price: 160, ratio: '3/1',
    gradient: 'linear-gradient(135deg, #2bf2c0, #4dd0ff, #7c5cff, #ff5edb)',
    icon: '✦', tag: 'Live'
  },
];

const CATEGORY_LABEL = {
  'thumbnail': 'Thumbnail',
  'logo': 'Logo',
  'banner-shop': 'Banner Shop',
  'banner-youtube': 'Banner YouTube',
  'banner-discord': 'Banner Discord',
};

/* ---------- State ---------- */
const STORAGE_KEY = 'nova_state_v1';
const defaultState = {
  hearts: 1000,
  owned: [],
  filterCategory: 'all',
  filterType: 'all',
};
const state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch { return { ...defaultState }; }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

/* ==========================================================
   SHOP — Render
   ========================================================== */

const grid = document.getElementById('shopGrid');
const empty = document.getElementById('shopEmpty');
const heartsCountEl = document.getElementById('heartsCount');

function updateHearts() {
  if (!heartsCountEl) return;
  heartsCountEl.textContent = state.hearts.toLocaleString('vi-VN');
}

function ratioToClass(r) {
  // map ratio strings to grid span size for masonry-like layout
  if (r === '5/2' || r === '3/1') return 'span-2';      // wide cards span 2 cols
  if (r === '16/9') return 'span-1';
  return 'span-1';
}

function productCard(p) {
  const owned = state.owned.includes(p.id);
  const animatedClass = p.type === 'animated' ? 'is-animated' : '';
  const spanClass = ratioToClass(p.ratio);

  return `
    <article class="shop-card glass ${animatedClass} ${spanClass}"
             data-id="${p.id}" data-cat="${p.category}" data-type="${p.type}">
      <div class="shop-thumb" style="aspect-ratio: ${p.ratio}; background: ${p.gradient};">
        <div class="thumb-icon">${p.icon}</div>
        <div class="thumb-shine"></div>
        <div class="thumb-overlay">
          <button class="thumb-view" data-action="view" aria-label="Xem ảnh lớn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Xem ảnh
          </button>
        </div>
        <span class="thumb-tag">${p.tag}</span>
        ${p.type === 'animated'
          ? '<span class="thumb-live"><span class="live-dot"></span>Động</span>'
          : '<span class="thumb-live static"><span class="live-dot"></span>Tĩnh</span>'}
      </div>

      <div class="shop-body">
        <div class="shop-cat">${CATEGORY_LABEL[p.category]}</div>
        <h3 class="shop-title">${p.title}</h3>
        <p class="shop-desc">${p.desc}</p>

        <div class="shop-foot">
          <div class="price">
            <span class="heart-icon">♥</span>
            <strong>${p.price}</strong>
          </div>
          ${owned
            ? '<button class="btn btn-owned" disabled>✓ Đã sở hữu</button>'
            : `<button class="btn btn-buy" data-action="buy">Mua ngay</button>`}
        </div>
      </div>
    </article>
  `;
}

function renderShop() {
  if (!grid) return;
  const filtered = PRODUCTS.filter((p) => {
    if (state.filterCategory !== 'all' && p.category !== state.filterCategory) return false;
    if (state.filterType !== 'all' && p.type !== state.filterType) return false;
    return true;
  });

  grid.innerHTML = filtered.map(productCard).join('');
  empty.hidden = filtered.length > 0;

  // re-observe for reveal animation
  grid.querySelectorAll('.shop-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 40}ms`;
    observe(el);
  });
}

/* ==========================================================
   Filter chips
   ========================================================== */

function setupFilter(containerId, key, dataAttr) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    wrap.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    state[key] = btn.dataset[dataAttr];
    saveState();
    renderShop();
  });
}
setupFilter('categoryFilter', 'filterCategory', 'cat');
setupFilter('typeFilter', 'filterType', 'type');

/* ==========================================================
   Buy / View handlers (event delegation)
   ========================================================== */

if (grid) {
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.shop-card');
    if (!card) return;
    const id = card.dataset.id;
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;

    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'buy') return handleBuy(product, card);
    if (action === 'view') return openLightbox(product);

    // click on card body (not button) → open lightbox
    if (!e.target.closest('button')) openLightbox(product);
  });
}

function handleBuy(product, cardEl) {
  if (state.owned.includes(product.id)) {
    toast(`Bạn đã sở hữu "${product.title}" rồi`, 'info');
    return;
  }
  if (state.hearts < product.price) {
    toast(`Không đủ tim! Cần thêm ${product.price - state.hearts} ♥`, 'error');
    cardEl?.classList.add('shake');
    setTimeout(() => cardEl?.classList.remove('shake'), 500);
    return;
  }
  state.hearts -= product.price;
  state.owned.push(product.id);
  saveState();
  updateHearts();
  flashHeart();
  toast(`✓ Đã mua "${product.title}" — Cảm ơn bạn!`, 'success');
  renderShop();

  // close lightbox if open
  if (lightbox.classList.contains('open')) closeLightbox();
}

/* ==========================================================
   Lightbox
   ========================================================== */

const lightbox = document.getElementById('lightbox');
const lightboxFrame = document.getElementById('lightboxFrame');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDesc = document.getElementById('lightboxDesc');
const lightboxType = document.getElementById('lightboxType');
const lightboxPrice = document.getElementById('lightboxPrice');
const lightboxBuy = document.getElementById('lightboxBuy');
const lightboxClose = document.getElementById('lightboxClose');
let currentLightboxId = null;

function openLightbox(p) {
  currentLightboxId = p.id;
  lightboxFrame.style.aspectRatio = p.ratio;
  lightboxFrame.style.background = p.gradient;
  lightboxFrame.className = 'lightbox-frame ' + (p.type === 'animated' ? 'is-animated' : '');
  lightboxFrame.innerHTML = `
    <div class="thumb-icon big">${p.icon}</div>
    <div class="thumb-shine"></div>
    <span class="thumb-tag">${p.tag}</span>
  `;
  lightboxTitle.textContent = p.title;
  lightboxDesc.textContent = p.desc;
  lightboxType.textContent = p.type === 'animated' ? '✨ Động' : 'Tĩnh';
  lightboxType.className = 'badge-type ' + (p.type === 'animated' ? 'animated' : '');
  lightboxPrice.textContent = p.price;

  const owned = state.owned.includes(p.id);
  lightboxBuy.disabled = owned;
  lightboxBuy.textContent = owned ? '✓ Đã sở hữu' : 'Mua bằng tim';

  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentLightboxId = null;
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}
if (lightboxBuy) {
  lightboxBuy.addEventListener('click', () => {
    const p = PRODUCTS.find((x) => x.id === currentLightboxId);
    if (p) handleBuy(p);
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

/* ==========================================================
   Hearts top-up (click on hearts pill to add 200)
   ========================================================== */

const heartsBtn = document.getElementById('heartsBtn');
if (heartsBtn) {
  heartsBtn.addEventListener('click', () => {
    state.hearts += 200;
    saveState();
    updateHearts();
    flashHeart();
    toast('+200 ♥ — Đã nạp thêm tim!', 'success');
  });
}

function flashHeart() {
  if (!heartsBtn) return;
  heartsBtn.classList.remove('flash');
  void heartsBtn.offsetWidth; // restart animation
  heartsBtn.classList.add('flash');
}

/* ==========================================================
   Toasts
   ========================================================== */

const toastStack = document.getElementById('toastStack');
function toast(msg, type = 'info') {
  if (!toastStack) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  toastStack.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

/* ==========================================================
   Init
   ========================================================== */
updateHearts();
// restore filter state
document.querySelector(`#categoryFilter .chip[data-cat="${state.filterCategory}"]`)?.classList.add('active');
document.querySelector(`#typeFilter .chip[data-type="${state.filterType}"]`)?.classList.add('active');
// remove default-active on chips that don't match restored state
document.querySelectorAll('#categoryFilter .chip').forEach((c) => {
  if (c.dataset.cat !== state.filterCategory) c.classList.remove('active');
});
document.querySelectorAll('#typeFilter .chip').forEach((c) => {
  if (c.dataset.type !== state.filterType) c.classList.remove('active');
});
renderShop();
