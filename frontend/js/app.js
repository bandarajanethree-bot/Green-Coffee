/* ==============================
   GREEN COFFEE CAFÉ - App Logic
============================== */

const API_BASE = 'http://localhost:5000/api';

// ── State ──────────────────────────────────
let currentPage = 'home';
let currentUser = null;
let menuData = [];
let activeMenuFilter = 'All';

// ── Auth Utils ─────────────────────────────
const getToken = () => localStorage.getItem('gcc_token');
const getUser = () => { try { return JSON.parse(localStorage.getItem('gcc_user')); } catch { return null; } };
const setAuth = (token, user) => { localStorage.setItem('gcc_token', token); localStorage.setItem('gcc_user', JSON.stringify(user)); currentUser = user; };
const clearAuth = () => { localStorage.removeItem('gcc_token'); localStorage.removeItem('gcc_user'); currentUser = null; };

// ── API Helper ─────────────────────────────
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  return res.json();
}

// ── Toast ──────────────────────────────────
function showToast(message, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast-custom ${type !== 'success' ? type : ''}`;
  toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3800);
}

// ── Navigation ─────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.add('active');
    currentPage = page;
  }

  const navLink = document.querySelector(`[data-page="${page}"]`);
  if (navLink) navLink.classList.add('active');

  // Run page-specific setup
  const handlers = {
    home: setupHome,
    dashboard: setupDashboard,
    menu: loadMenuPage,
  };
  if (handlers[page]) handlers[page]();

  updateNavForUser();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Navbar User Update ─────────────────────
function updateNavForUser() {
  const user = getUser();
  const navLoggedOut = document.getElementById('navLoggedOut');
  const navLoggedIn = document.getElementById('navLoggedIn');
  const navUserName = document.getElementById('navUserName');

  if (user) {
    navLoggedOut.style.display = 'none';
    navLoggedIn.style.display = 'flex';
    if (navUserName) navUserName.textContent = user.name.split(' ')[0];
  } else {
    navLoggedOut.style.display = 'flex';
    navLoggedIn.style.display = 'none';
  }
}

// ── Auth: Register ─────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  const phone = document.getElementById('regPhone').value.trim();

  if (password !== confirm) { showToast('Passwords do not match.', 'error'); return; }
  if (password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-green"></span> Creating Account...';

  try {
    const data = await apiCall('/auth/register', 'POST', { name, email, password, phone });
    if (data.success) {
      setAuth(data.token, data.user);
      showToast(data.message, 'success');
      setTimeout(() => navigate('dashboard'), 800);
    } else {
      const msg = data.errors ? data.errors.map(e => e.msg).join(', ') : data.message;
      showToast(msg, 'error');
    }
  } catch (err) {
    showToast('Connection error. Is the server running?', 'error');
  }
  btn.disabled = false;
  btn.innerHTML = 'Create Account <span>→</span>';
}

// ── Auth: Login ────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-green"></span> Signing In...';

  try {
    const data = await apiCall('/auth/login', 'POST', { email, password });
    if (data.success) {
      setAuth(data.token, data.user);
      showToast(data.message, 'success');
      setTimeout(() => navigate('dashboard'), 800);
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Connection error. Is the server running?', 'error');
  }
  btn.disabled = false;
  btn.innerHTML = 'Sign In <span>→</span>';
}

// ── Auth: Logout ───────────────────────────
function handleLogout() {
  clearAuth();
  showToast('Logged out. See you soon! ☕', 'info');
  navigate('home');
}

// ── Protected Route ────────────────────────
function goToDashboard() {
  if (!getToken()) {
    showToast('Please sign in to access your dashboard.', 'warning');
    navigate('login');
    return;
  }
  navigate('dashboard');
}

// ── Home Setup ─────────────────────────────
async function setupHome() {
  // Load featured menu items
  try {
    if (menuData.length === 0) {
      const data = await apiCall('/menu');
      if (data.success) menuData = data.data;
    }
    renderFeaturedMenu();
  } catch (e) {}
}

function renderFeaturedMenu() {
  const container = document.getElementById('featuredMenuGrid');
  if (!container || !menuData.length) return;

  const popular = menuData.filter(i => i.popular).slice(0, 3);
  container.innerHTML = popular.map(item => `
    <div class="col-md-4">
      <div class="menu-card">
        <img src="${getPlaceholderImg(item.category)}" class="menu-card-img" alt="${item.name}">
        <div class="menu-card-body">
          <div class="menu-card-category">${item.category}</div>
          <div class="menu-card-name">${item.name} ${item.popular ? '<span class="popular-badge">Popular</span>' : ''}</div>
          <div class="menu-card-desc">${item.description}</div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="menu-card-price">$${item.price.toFixed(2)}</span>
            <button class="btn-outline-green" style="padding:0.4rem 1rem;font-size:0.8rem;" onclick="navigate('menu')">Order</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function getPlaceholderImg(category) {
  const imgs = {
    'Hot Coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=280&fit=crop',
    'Cold Brew': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=280&fit=crop',
    'Specialty': 'https://images.unsplash.com/photo-1542525654-1abc2b7a42f7?w=400&h=280&fit=crop',
    'Food': 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=280&fit=crop',
  };
  return imgs[category] || imgs['Hot Coffee'];
}

// ── Menu Page ──────────────────────────────
async function loadMenuPage() {
  try {
    if (menuData.length === 0) {
      const data = await apiCall('/menu');
      if (data.success) menuData = data.data;
    }
    renderMenuFilters();
    renderMenuItems('All');
  } catch (e) {
    showToast('Could not load menu. Please check your connection.', 'error');
  }
}

function renderMenuFilters() {
  const container = document.getElementById('menuFilters');
  if (!container) return;
  const categories = ['All', ...new Set(menuData.map(i => i.category))];
  container.innerHTML = categories.map(c =>
    `<button class="filter-pill ${c === activeMenuFilter ? 'active' : ''}" onclick="filterMenu('${c}')">${c}</button>`
  ).join('');
}

function filterMenu(category) {
  activeMenuFilter = category;
  renderMenuFilters();
  renderMenuItems(category);
}

function renderMenuItems(category) {
  const container = document.getElementById('menuGrid');
  if (!container) return;
  const items = category === 'All' ? menuData : menuData.filter(i => i.category === category);
  container.innerHTML = items.map(item => `
    <div class="col-sm-6 col-lg-4">
      <div class="menu-card">
        <img src="${getPlaceholderImg(item.category)}" class="menu-card-img" alt="${item.name}" loading="lazy">
        <div class="menu-card-body">
          <div class="menu-card-category">${item.category}</div>
          <div class="menu-card-name">${item.name} ${item.popular ? '<span class="popular-badge">Popular</span>' : ''}</div>
          <div class="menu-card-desc">${item.description}</div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <span class="menu-card-price">$${item.price.toFixed(2)}</span>
            <button class="btn-primary-green" style="padding:0.4rem 1rem;font-size:0.8rem;" onclick="addToCartToast('${item.name}')">Add ＋</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCartToast(name) {
  showToast(`${name} added! ☕`, 'success');
}

// ── Dashboard Setup ────────────────────────
async function setupDashboard() {
  const user = getUser();
  if (!user) { navigate('login'); return; }

  document.getElementById('dashUserName').textContent = user.name;
  document.getElementById('dashUserEmail').textContent = user.email;
  document.getElementById('dashPoints').textContent = user.loyaltyPoints || 0;
  document.getElementById('dashMemberSince').textContent = new Date().getFullYear();

  const pts = user.loyaltyPoints || 0;
  const nextLevel = pts < 100 ? 100 : pts < 250 ? 250 : 500;
  const pct = Math.min((pts / nextLevel) * 100, 100);
  document.getElementById('loyaltyProgress').style.width = pct + '%';
  document.getElementById('loyaltyProgressText').textContent = `${pts} / ${nextLevel} pts to next reward`;

  // Profile form
  document.getElementById('profileName').value = user.name || '';
  document.getElementById('profileEmail').value = user.email || '';
  document.getElementById('profilePhone').value = user.phone || '';
  document.getElementById('profileFav').value = user.favoriteOrder || '';
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const btn = document.getElementById('profileUpdateBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-green"></span> Saving...';

  const name = document.getElementById('profileName').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const favoriteOrder = document.getElementById('profileFav').value.trim();

  try {
    const data = await apiCall('/auth/profile', 'PUT', { name, phone, favoriteOrder });
    if (data.success) {
      const updated = { ...getUser(), name, phone, favoriteOrder };
      localStorage.setItem('gcc_user', JSON.stringify(updated));
      showToast('Profile updated! ✨', 'success');
      updateNavForUser();
    } else {
      showToast(data.message, 'error');
    }
  } catch (e) {
    showToast('Connection error.', 'error');
  }
  btn.disabled = false;
  btn.innerHTML = 'Save Changes';
}

// ── Contact Form ───────────────────────────
async function handleContact(e) {
  e.preventDefault();
  const btn = document.getElementById('contactBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-green"></span> Sending...';

  const payload = {
    name: document.getElementById('contactName').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    subject: document.getElementById('contactSubject').value.trim(),
    message: document.getElementById('contactMessage').value.trim(),
  };

  try {
    const data = await apiCall('/contact', 'POST', payload);
    if (data.success) {
      showToast(data.message, 'success');
      e.target.reset();
    } else {
      const msg = data.errors ? data.errors.map(e => e.msg).join(', ') : data.message;
      showToast(msg, 'error');
    }
  } catch (err) {
    showToast('Connection error. Please try again.', 'error');
  }
  btn.disabled = false;
  btn.innerHTML = 'Send Message ✉️';
}

// ── Dashboard Tab ──────────────────────────
function showDashTab(tab) {
  document.querySelectorAll('.dash-tab').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.sidebar-nav-item[data-tab]').forEach(i => i.classList.remove('active'));
  document.getElementById(`dash-${tab}`).style.display = 'block';
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
}

// ── Navbar Scroll Effect ───────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
});

// ── Init ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  currentUser = getUser();
  updateNavForUser();
  navigate('home');

  // Register form
  const regForm = document.getElementById('registerForm');
  if (regForm) regForm.addEventListener('submit', handleRegister);

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) contactForm.addEventListener('submit', handleContact);

  // Profile form
  const profileForm = document.getElementById('profileForm');
  if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);

  // Password toggle
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁' : '🙈';
    });
  });
});
