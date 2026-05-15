/* ==========================================================
   NOVA — Designer Portfolio + Shop  v3
   ========================================================== */

/* ── Cursor spotlight glow ── */
const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow) {
  document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--cx', e.clientX + 'px');
    document.documentElement.style.setProperty('--cy', e.clientY + 'px');
  });
}

/* ── Hero orb parallax ── */
const orb = document.querySelector('.orb');
if (orb) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 22;
    const y = (e.clientY / window.innerHeight - 0.5) * 22;
    orb.style.translate = `${x}px ${y}px`;
  });
}

/* ── Mobile menu ── */
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');
if (menuToggle) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') navLinks.classList.remove('open');
  });
}

/* ── Scroll-reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.style.opacity  = '1';
    entry.target.style.transform = 'translateY(0) scale(1)';
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08 });

function observe(el, delay = 0) {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(28px) scale(0.98)';
  el.style.transition = `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`;
  revealObserver.observe(el);
}

document.querySelectorAll(
  '.card, .project, .section-head, .about-text, .contact-card, .shop-toolbar'
).forEach((el) => observe(el));

/* ── 3-D card tilt on mouse ── */
function addTilt(el) {
  el.addEventListener('mousemove', (e) => {
    const r  = el.getBoundingClientRect();
    const xC = (e.clientX - r.left) / r.width  - 0.5;   // -0.5 → 0.5
    const yC = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `translateY(-10px) rotateY(${xC * 8}deg) rotateX(${-yC * 6}deg) scale(1.015)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
    el.style.transition = 'transform .55s cubic-bezier(.22,.8,.22,1)';
  });
  el.addEventListener('mouseenter', () => {
    el.style.transition = 'transform .18s ease';
  });
}

/* ==========================================================
   PRODUCTS DATA
   ========================================================== */
const PRODUCTS = [
  /* ── Thumbnails 16:9 ── */
  {
    id:'th-01', title:'Gaming Thumbnail · Neon',
    desc:'Thumbnail YouTube tone neon chuẩn gaming channel. PSD + Figma sẵn chỉnh sửa.',
    category:'thumbnail', type:'static', price:80, ratio:'16/9',
    gradient:'linear-gradient(135deg,#ff2e63 0%,#7c5cff 50%,#08d9d6 100%)',
    icon:'▶', tag:'YT Gaming',
    features:['File PSD + Figma','Font miễn phí','Hướng dẫn edit'],
  },
  {
    id:'th-02', title:'Vlog Thumbnail · Cinematic',
    desc:'Layout cinematic cho vlog du lịch — gradient mềm, typo lớn ấn tượng.',
    category:'thumbnail', type:'static', price:70, ratio:'16/9',
    gradient:'linear-gradient(135deg,#ffb56b 0%,#ff5edb 100%)',
    icon:'✈', tag:'Vlog',
    features:['Tỉ lệ 1280×720','Nhiều biến thể màu','Dễ thay ảnh'],
  },
  {
    id:'th-03', title:'Animated Thumbnail · Motion',
    desc:'Thumbnail có animation glow & particle — xuất After Effects + Lottie JSON.',
    category:'thumbnail', type:'animated', price:150, ratio:'16/9',
    gradient:'linear-gradient(135deg,#00f5a0,#00d9f5,#7c5cff)',
    icon:'✦', tag:'Motion',
    features:['After Effects source','Export Lottie JSON','Loop mượt 60fps'],
  },

  /* ── Logos 1:1 ── */
  {
    id:'lg-01', title:'Minimal Logo · Mono',
    desc:'Logo monogram tối giản. Vector SVG + AI, dùng được mọi nền.',
    category:'logo', type:'static', price:120, ratio:'1/1',
    gradient:'linear-gradient(135deg,#1a1a2e,#4dd0ff 200%)',
    icon:'N', tag:'Mono',
    features:['File SVG + AI','Dễ đổi màu','Dark & light version'],
  },
  {
    id:'lg-02', title:'Animated Logo · Reveal',
    desc:'Logo reveal animation cho intro video. Xuất Lottie + MP4 transparent.',
    category:'logo', type:'animated', price:220, ratio:'1/1',
    gradient:'linear-gradient(135deg,#7c5cff,#ff5edb)',
    icon:'✦', tag:'Lottie',
    features:['Lottie JSON + MP4','After Effects source','Intro 2–3 giây'],
  },
  {
    id:'lg-03', title:'Esport Logo · Mascot',
    desc:'Logo mascot cho team esport — file vector chỉnh sửa tự do.',
    category:'logo', type:'static', price:180, ratio:'1/1',
    gradient:'linear-gradient(135deg,#ff2e63,#ffd166)',
    icon:'⚔', tag:'Esport',
    features:['SVG + AI + PNG','3 colorway','Mascot + wordmark'],
  },

  /* ── Banner Shop 5:2 ── */
  {
    id:'bs-01', title:'Shopee Banner · Sale Flash',
    desc:'Banner sale flash cho shop Shopee/Lazada, nhiều size chuẩn marketplace.',
    category:'banner-shop', type:'static', price:100, ratio:'5/2',
    gradient:'linear-gradient(135deg,#ff5e62 0%,#ff9966 100%)',
    icon:'🛍', tag:'Sale',
    features:['PSD multi-size','Chuẩn Shopee/Lazada','Dễ thay text & logo'],
  },
  {
    id:'bs-02', title:'Shop Banner · Animated GIF',
    desc:'Banner shop động dạng GIF 800×320 — loop nhẹ, phù hợp mọi marketplace.',
    category:'banner-shop', type:'animated', price:180, ratio:'5/2',
    gradient:'linear-gradient(135deg,#2bf2c0,#4dd0ff,#7c5cff)',
    icon:'⚡', tag:'GIF',
    features:['GIF loop nhẹ <500KB','Source PSD','3 màu tùy chọn'],
  },

  /* ── YouTube Banner 16:9 ── */
  {
    id:'yt-01', title:'YouTube Banner · Tech',
    desc:'Channel art cho kênh tech/review, 2560×1440 chuẩn YT. Responsive mọi thiết bị.',
    category:'banner-youtube', type:'static', price:120, ratio:'16/9',
    gradient:'linear-gradient(135deg,#0f2027,#2c5364,#00d9f5)',
    icon:'▶', tag:'Tech',
    features:['2560×1440px','Safe zone đầy đủ','PSD source'],
  },
  {
    id:'yt-02', title:'YouTube Banner · Animated',
    desc:'Banner YT hiệu ứng động, xuất MP4 + GIF cho intro stream.',
    category:'banner-youtube', type:'animated', price:200, ratio:'16/9',
    gradient:'linear-gradient(135deg,#ff2e63,#7c5cff,#08d9d6)',
    icon:'✦', tag:'Motion',
    features:['MP4 + GIF export','Loop 5 giây','After Effects source'],
  },

  /* ── Discord Banner 3:1 ── */
  {
    id:'dc-01', title:'Discord Banner · Aesthetic',
    desc:'Banner server Discord tone tím mềm aesthetic — 960×540 chuẩn Discord.',
    category:'banner-discord', type:'static', price:90, ratio:'3/1',
    gradient:'linear-gradient(135deg,#5865f2,#7c5cff,#ff5edb)',
    icon:'#', tag:'Aesthetic',
    features:['960×540px','PSD source','Icon + wordmark'],
  },
  {
    id:'dc-02', title:'Discord Banner · Live Gradient',
    desc:'Banner server Discord gradient liên tục chuyển màu — xuất GIF loop.',
    category:'banner-discord', type:'animated', price:160, ratio:'3/1',
    gradient:'linear-gradient(135deg,#2bf2c0,#4dd0ff,#7c5cff,#ff5edb)',
    icon:'✦', tag:'Live',
    features:['GIF loop mượt','3 tốc độ animation','PSD + AE source'],
  },
];

const CAT_LABEL = {
  thumbnail:'Thumbnail', logo:'Logo',
  'banner-shop':'Banner Shop', 'banner-youtube':'Banner YouTube', 'banner-discord':'Banner Discord',
};

/* ==========================================================
   STATE  (localStorage)
   ========================================================== */
const STORE_KEY = 'nova_v3';
function defState() { return { hearts:1000, owned:[], filterCat:'all', filterType:'all' }; }

const state = (() => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? { ...defState(), ...JSON.parse(raw) } : defState();
  } catch { return defState(); }
})();

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}

/* ==========================================================
   HEARTS UI
   ========================================================== */
const heartsCountEl = document.getElementById('heartsCount');
const heartsBtn     = document.getElementById('heartsBtn');

function updateHeartsUI() {
  if (heartsCountEl) heartsCountEl.textContent = state.hearts.toLocaleString('vi-VN');
}

function flashHeartBtn() {
  if (!heartsBtn) return;
  heartsBtn.classList.remove('flash');
  void heartsBtn.offsetWidth;
  heartsBtn.classList.add('flash');
}

if (heartsBtn) {
  heartsBtn.addEventListener('click', () => {
    state.hearts += 200;
    save();
    updateHeartsUI();
    flashHeartBtn();
    toast('Nạp tim', '+200 ♥ đã được cộng vào tài khoản!', 'success');
  });
}

/* ==========================================================
   SHOP RENDER
   ========================================================== */
const shopGrid = document.getElementById('shopGrid');
const shopEmpty = document.getElementById('shopEmpty');

function ratioSpan(r) {
  return (r === '5/2' || r === '3/1') ? 'span-2' : 'span-1';
}

function cardHTML(p) {
  const owned = state.owned.includes(p.id);
  return `
  <article class="shop-card ${p.type === 'animated' ? 'is-animated' : ''} ${ratioSpan(p.ratio)}"
           data-id="${p.id}">
    <div class="shop-thumb" style="aspect-ratio:${p.ratio};background:${p.gradient}">
      <div class="thumb-shine"></div>
      <div class="thumb-icon">${p.icon}</div>
      <div class="thumb-overlay">
        <button class="thumb-view" data-action="view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          Xem ảnh
        </button>
      </div>
      <span class="thumb-tag">${p.tag}</span>
      <span class="thumb-live ${p.type === 'static' ? 'static' : ''}">
        <span class="live-dot"></span>${p.type === 'animated' ? 'Động' : 'Tĩnh'}
      </span>
    </div>
    <div class="shop-body">
      <div class="shop-cat">${CAT_LABEL[p.category]}</div>
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
  </article>`;
}

function renderShop() {
  if (!shopGrid) return;
  const list = PRODUCTS.filter((p) => {
    if (state.filterCat  !== 'all' && p.category !== state.filterCat)  return false;
    if (state.filterType !== 'all' && p.type     !== state.filterType) return false;
    return true;
  });
  shopGrid.innerHTML = list.map(cardHTML).join('');
  shopEmpty.hidden = list.length > 0;

  // staggered reveal + tilt
  shopGrid.querySelectorAll('.shop-card').forEach((el, i) => {
    observe(el, i * 45);
    addTilt(el);
  });
}

/* ── Filter chips ── */
function bindFilter(containerId, stateKey, dataAttr) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    wrap.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    state[stateKey] = chip.dataset[dataAttr];
    save();
    renderShop();
  });
}
bindFilter('categoryFilter', 'filterCat',  'cat');
bindFilter('typeFilter',     'filterType', 'type');

/* ── Card click delegation ── */
if (shopGrid) {
  shopGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.shop-card');
    if (!card) return;
    const product = PRODUCTS.find((p) => p.id === card.dataset.id);
    if (!product) return;
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'buy')  return doBuy(product, card);
    if (action === 'view') return openLightbox(product);
    if (!e.target.closest('button')) openLightbox(product);
  });
}

/* ==========================================================
   BUY LOGIC
   ========================================================== */
function doBuy(product, cardEl) {
  if (state.owned.includes(product.id)) {
    toast('Đã sở hữu', `Bạn đã có "${product.title}" trong bộ sưu tập rồi!`, 'info');
    return;
  }
  if (state.hearts < product.price) {
    const need = product.price - state.hearts;
    toast('Không đủ tim', `Cần thêm ${need} ♥ để mua sản phẩm này.`, 'error');
    cardEl?.classList.add('shake');
    setTimeout(() => cardEl?.classList.remove('shake'), 500);
    return;
  }
  state.hearts -= product.price;
  state.owned.push(product.id);
  save();
  updateHeartsUI();
  flashHeartBtn();
  spawnHeartsParticles();
  toast('Mua thành công!', `"${product.title}" đã vào bộ sưu tập của bạn ✦`, 'success');
  renderShop();
  if (lightboxEl?.classList.contains('open')) closeLightbox();
}

/* ── Heart particles burst on purchase ── */
function spawnHeartsParticles() {
  if (!heartsBtn) return;
  const rect = heartsBtn.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'heart-particle';
    p.textContent = '♥';
    const angle  = (Math.random() * 360) * (Math.PI / 180);
    const dist   = 40 + Math.random() * 60;
    const dx     = Math.cos(angle) * dist;
    const dy     = Math.sin(angle) * dist;
    const size   = 10 + Math.random() * 12;
    const dur    = 600 + Math.random() * 400;
    Object.assign(p.style, {
      position:'fixed', left:`${cx}px`, top:`${cy}px`,
      fontSize:`${size}px`, color:'var(--pink)',
      pointerEvents:'none', zIndex:'9999',
      filter:'drop-shadow(0 0 6px rgba(255,94,219,.8))',
      transition:`transform ${dur}ms ease, opacity ${dur}ms ease`,
      transform:'translate(-50%,-50%)',
    });
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        p.style.opacity   = '0';
      });
    });
    setTimeout(() => p.remove(), dur + 50);
  }
}

/* ==========================================================
   LIGHTBOX
   ========================================================== */
const lightboxEl      = document.getElementById('lightbox');
const lightboxFrame   = document.getElementById('lightboxFrame');
const lightboxTitle   = document.getElementById('lightboxTitle');
const lightboxDesc    = document.getElementById('lightboxDesc');
const lightboxType    = document.getElementById('lightboxType');
const lightboxPrice   = document.getElementById('lightboxPrice');
const lightboxBuyBtn  = document.getElementById('lightboxBuy');
const lightboxCloseBtn= document.getElementById('lightboxClose');
let   activeLightboxId = null;

function openLightbox(p) {
  activeLightboxId = p.id;

  // preview frame
  lightboxFrame.style.aspectRatio = p.ratio;
  lightboxFrame.style.background  = p.gradient;
  lightboxFrame.className = 'lightbox-frame' + (p.type === 'animated' ? ' is-animated' : '');
  lightboxFrame.innerHTML = `
    <div class="thumb-icon big">${p.icon}</div>
    <div class="thumb-shine"></div>
    <span class="thumb-tag">${p.tag}</span>`;

  // info panel
  lightboxTitle.textContent = p.title;
  lightboxDesc.textContent  = p.desc;
  lightboxType.textContent  = p.type === 'animated' ? '✨ Động' : '◻ Tĩnh';
  lightboxType.className    = 'badge-type' + (p.type === 'animated' ? ' animated' : '');
  lightboxPrice.textContent = p.price;

  // features list
  let featEl = lightboxEl.querySelector('.lightbox-features');
  if (!featEl) {
    featEl = document.createElement('ul');
    featEl.className = 'lightbox-features';
    lightboxBuyBtn.parentNode.insertBefore(featEl, lightboxBuyBtn);
  }
  featEl.innerHTML = (p.features || []).map((f) => `<li>${f}</li>`).join('');

  // buy button state
  const owned = state.owned.includes(p.id);
  lightboxBuyBtn.disabled    = owned;
  lightboxBuyBtn.textContent = owned ? '✓ Đã sở hữu' : `Mua bằng ♥ ${p.price} tim`;

  lightboxEl.classList.add('open');
  lightboxEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxEl.classList.remove('open');
  lightboxEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeLightboxId = null;
}

if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
if (lightboxEl)       lightboxEl.addEventListener('click', (e) => { if (e.target === lightboxEl) closeLightbox(); });
if (lightboxBuyBtn) {
  lightboxBuyBtn.addEventListener('click', () => {
    const p = PRODUCTS.find((x) => x.id === activeLightboxId);
    if (p) doBuy(p);
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightboxEl?.classList.contains('open')) closeLightbox();
});

/* ==========================================================
   TOAST  (with icon + title + progress bar)
   ========================================================== */
const toastStack = document.getElementById('toastStack');

const TOAST_ICONS = { success:'✓', error:'✕', info:'ℹ', warn:'⚠' };

function toast(title, msg, type = 'info') {
  if (!toastStack) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <div class="toast-icon">${TOAST_ICONS[type] ?? 'ℹ'}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <div class="toast-bar"></div>`;
  toastStack.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 380);
  }, 2800);
}

/* ==========================================================
   INIT
   ========================================================== */
updateHeartsUI();

// restore active filter chips from saved state
document.querySelectorAll('#categoryFilter .chip').forEach((c) => {
  c.classList.toggle('active', c.dataset.cat  === state.filterCat);
});
document.querySelectorAll('#typeFilter .chip').forEach((c) => {
  c.classList.toggle('active', c.dataset.type === state.filterType);
});

renderShop();
