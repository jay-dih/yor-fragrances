// ===== MAIN.JS =====

// ---- TOAST ----
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

// ---- NAVBAR ----
function toggleMobileMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}
function toggleUserMenu() {
  document.getElementById('userDropdown')?.classList.toggle('show');
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-user-menu')) {
    document.getElementById('userDropdown')?.classList.remove('show');
  }
  if (!e.target.closest('.nav-search')) {
    document.getElementById('searchDropdown')?.classList.remove('show');
  }
});

// ---- USER DROPDOWN ----
function renderUserDropdown() {
  const user = getCurrentUser();
  const content = document.getElementById('userDropdownContent');
  if (!content) return;
  if (user) {
    content.innerHTML = `
      <div class="user-info"><strong>${user.name}</strong>${user.role === 'admin' ? 'Administrator' : 'Customer'}</div>
      ${user.role === 'admin' ? '<a href="admin.html">⚙️ Admin Panel</a>' : ''}
      <button onclick="logoutUser()">Logout</button>
    `;
  } else {
    content.innerHTML = `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }
}
renderUserDropdown();

// ---- CART COUNT ----
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const els = document.querySelectorAll('#cartCount');
  els.forEach(el => el.textContent = total);
}
updateCartCount();

// ---- RENDER PRODUCTS ----
function renderProducts(gridId, products) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  if (!products || products.length === 0) {
    grid.innerHTML = '<p style="padding:40px;color:var(--text-light);grid-column:1/-1">No products found.</p>';
    return;
  }
  grid.innerHTML = products.map(p => `
    <div class="product-card" onclick="openProductDetail(${p.id})">
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" onerror="this.src=''; this.style.background='var(--sand-light)'"/>
      </div>
      <div class="product-info">
        ${p.featured ? '<span class="badge-featured">Best Seller</span>' : ''}
        <h3>${p.name}</h3>
        <p class="product-price">₱${p.price.toLocaleString()}.00</p>
        <div class="product-actions">
          <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
          <button class="btn-inquire" onclick="event.stopPropagation(); inquireProduct('${p.name}')">Inquire</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ---- PRODUCT DETAIL MODAL ----
let detailQty = 1;

function openProductDetail(id) {
  const products = getProducts();
  const p = products.find(pr => pr.id === id);
  if (!p) return;
  detailQty = 1;

  let overlay = document.getElementById('productDetailOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'productDetailOverlay';
    overlay.className = 'product-detail-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) closeProductDetail(); };
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="product-detail">
      <div class="product-detail-img">
        <img src="${p.image}" alt="${p.name}" onerror="this.src=''; this.style.background='var(--sand-light)'"/>
      </div>
      <div class="product-detail-info" style="position:relative;">
        <button class="close-detail" onclick="closeProductDetail()">&#10005;</button>
        <p class="detail-cat">${p.category.toUpperCase()}'S</p>
        <h2>${p.name}</h2>
        <p class="detail-price">₱${p.price.toLocaleString()}.00</p>
        <p class="detail-desc">${p.description || 'A uniquely crafted YOR original fragrance.'}</p>
        <p class="detail-stock">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>
        <div class="detail-actions">
          <div class="detail-qty-row">
            <button onclick="changeDetailQty(-1)">−</button>
            <span id="detailQty">1</span>
            <button onclick="changeDetailQty(1)">+</button>
          </div>
          <button class="btn-add-cart" onclick="addToCart(${p.id}, detailQty); closeProductDetail()">Add to Cart</button>
          <button class="btn-inquire" onclick="inquireProduct('${p.name}')">Send Inquiry</button>
        </div>
      </div>
    </div>
  `;
  overlay.classList.add('open');
}

function changeDetailQty(delta) {
  detailQty = Math.max(1, detailQty + delta);
  const el = document.getElementById('detailQty');
  if (el) el.textContent = detailQty;
}

function closeProductDetail() {
  document.getElementById('productDetailOverlay')?.classList.remove('open');
}

// ---- CART ----
function addToCart(productId, qty = 1) {
  const products = getProducts();
  const p = products.find(pr => pr.id === productId);
  if (!p) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += qty;
    existing.selected = true;
  } else {
    cart.push({ id: productId, name: p.name, price: p.price, image: p.image, qty, selected: true });
  }
  saveCart(cart);
  updateCartCount();
  showToast(`"${p.name}" added to cart`);
}

function renderCart() {
  const cart = getCart();
  const itemsEl = document.getElementById('cartItems');
  const summaryEl = document.getElementById('cartSummary');
  if (!itemsEl || !summaryEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><p>Your cart is empty.</p><a href="shop.html">← Continue Shopping</a></div>`;
    summaryEl.innerHTML = '';
    return;
  }

  const allSelected = cart.every(i => i.selected !== false);
  let subtotal = 0;
  
  let html = `
    <div class="cart-header" style="display:flex; align-items:center; gap:12px; padding:16px 0; border-bottom:1px solid var(--sand-light); margin-bottom:12px;">
      <input type="checkbox" id="selectAllCart" class="custom-checkbox" ${allSelected ? 'checked' : ''} onchange="toggleAllCartSelection(this.checked)" />
      <label for="selectAllCart" style="font-size:0.9rem; cursor:pointer; font-weight:500;">Select All (${cart.length} items)</label>
    </div>
  `;

  html += cart.map(item => {
    const isChecked = item.selected !== false;
    if (isChecked) subtotal += item.price * item.qty;
    return `
      <div class="cart-item">
        <div style="display:flex; align-items:center; justify-content:center;">
          <input type="checkbox" class="custom-checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCartSelection(${item.id})" />
        </div>
        <img src="${item.image}" alt="${item.name}" onerror="this.src=''; this.style.background='var(--sand-light)'"/>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>₱${item.price.toLocaleString()}.00 each</p>
          <div class="cart-item-qty">
            <button onclick="updateCartQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateCartQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <div>
          <p class="cart-item-price">₱${(item.price * item.qty).toLocaleString()}.00</p>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    `;
  }).join('');
  
  itemsEl.innerHTML = html;

  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 100;
  summaryEl.innerHTML = `
    <h3>Order Summary</h3>
    <div class="summary-row"><span>Subtotal</span><span>₱${subtotal.toLocaleString()}.00</span></div>
    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : '₱' + shipping}</span></div>
    <div class="summary-row total"><span>Total</span><span>₱${(subtotal + shipping).toLocaleString()}.00</span></div>
    <button class="checkout-btn" onclick="checkout()">Place Order</button>
    <a href="shop.html" class="continue-shopping">← Continue Shopping</a>
  `;
}

function toggleCartSelection(productId) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.selected = item.selected === false ? true : false;
    saveCart(cart);
    renderCart();
  }
}

function toggleAllCartSelection(isChecked) {
  const cart = getCart();
  cart.forEach(i => i.selected = isChecked);
  saveCart(cart);
  renderCart();
}

function updateCartQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  updateCartCount();
  renderCart();
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  updateCartCount();
  renderCart();
  showToast('Item removed from cart');
}

function checkout() {
  const user = getCurrentUser();
  if (!user) {
    if (confirm('Please log in to place an order. Go to login page?')) window.location.href = 'login.html';
    return;
  }
  const cart = getCart();
  const selectedItems = cart.filter(i => i.selected !== false);
  
  if (selectedItems.length === 0) {
    showToast('Please select at least one item to checkout.');
    return;
  }
  
  // Save order
  const orders = getOrders();
  const newOrder = {
    id: 'ORD-' + String(orders.length + 1).padStart(3, '0'),
    customer: user.name,
    items: selectedItems.map(i => `${i.name} x${i.qty}`).join(', '),
    total: selectedItems.reduce((s, i) => s + i.price * i.qty, 0),
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  };
  orders.push(newOrder);
  localStorage.setItem('yor_orders', JSON.stringify(orders));
  
  const remainingCart = cart.filter(i => i.selected === false);
  saveCart(remainingCart);
  
  updateCartCount();
  showToast('Order placed! We\'ll contact you to confirm.');
  setTimeout(() => renderCart(), 500);
}

// ---- SEARCH ----
let searchTimeout;
function handleSearch(val) {
  clearTimeout(searchTimeout);
  if (!val.trim()) { hideSearchDropdown(); return; }
  searchTimeout = setTimeout(() => {
    const results = getProducts().filter(p =>
      p.name.toLowerCase().includes(val.toLowerCase()) ||
      p.category.includes(val.toLowerCase())
    ).slice(0, 5);
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;
    if (results.length === 0) {
      dropdown.innerHTML = '<p style="padding:12px 16px;font-size:0.82rem;color:var(--text-light)">No results found</p>';
    } else {
      dropdown.innerHTML = results.map(p => `
        <div class="search-item" onclick="openProductDetail(${p.id})">
          <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'"/>
          <div class="search-item-info">
            <strong>${p.name}</strong>
            <span>₱${p.price.toLocaleString()}.00</span>
          </div>
        </div>
      `).join('');
    }
    dropdown.classList.add('show');
  }, 300);
}
function showSearchDropdown() {
  const inp = document.getElementById('searchInput');
  if (inp?.value.trim()) document.getElementById('searchDropdown')?.classList.add('show');
}
function hideSearchDropdown() {
  setTimeout(() => document.getElementById('searchDropdown')?.classList.remove('show'), 200);
}

// ---- FILTER / CATEGORY ----
let activeCategory = 'all';

function filterCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyFilters();
}

function toggleFilterPanel() {
  document.getElementById('filterPanel')?.classList.toggle('open');
}

function applyFilters() {
  let products = getProducts(activeCategory === 'all' ? null : activeCategory);
  const price = document.getElementById('priceFilter')?.value || 'all';
  const sort = document.getElementById('sortFilter')?.value || 'default';
  const note = document.getElementById('notesFilter')?.value || 'all';

  if (note !== 'all') {
    products = products.filter(p => p.notes === note);
  }

  if (price !== 'all') {
    if (price === '2000+') products = products.filter(p => p.price >= 2000);
    else {
      const [min, max] = price.split('-').map(Number);
      products = products.filter(p => p.price >= min && p.price <= max);
    }
  }
  if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'name-asc') products.sort((a, b) => a.name.localeCompare(b.name));

  renderProducts('productsGrid', products);
}

// ---- LOAD MORE ----
let loadedCount = 8;
function loadMore() {
  const products = getProducts(activeCategory === 'all' ? null : activeCategory);
  loadedCount = Math.min(loadedCount + 4, products.length);
  renderProducts('productsGrid', products.slice(0, loadedCount));
  if (loadedCount >= products.length) {
    document.getElementById('loadMoreBtn').style.display = 'none';
  }
}

// ---- AUTH ----
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const users = getUsers();
  const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
  if (!user) { showToast('Invalid username or password'); return; }
  const { password: _, ...safeUser } = user;
  setCurrentUser(safeUser);
  showToast(`Welcome back, ${user.name}!`);
  setTimeout(() => {
    window.location.href = user.role === 'admin' ? 'admin.html' : 'index.html';
  }, 800);
}

function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('regName').value.trim();
  const uname = document.getElementById('regUser').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPass').value;
  const conf  = document.getElementById('regPassConfirm').value;

  if (pass !== conf) { showToast('Passwords do not match'); return; }
  const users = getUsers();
  if (users.find(u => u.username === uname)) { showToast('Username already taken'); return; }
  if (users.find(u => u.email === email)) { showToast('Email already registered'); return; }

  const newUser = {
    id: Date.now(), username: uname, password: pass, name, email,
    role: 'user', registered: new Date().toISOString().split('T')[0]
  };
  users.push(newUser);
  saveUsers(users);
  const { password: _, ...safeUser } = newUser;
  setCurrentUser(safeUser);
  showToast('Account created! Welcome to YOR Fragrances.');
  setTimeout(() => window.location.href = 'index.html', 900);
}

function logoutUser() {
  setCurrentUser(null);
  showToast('Logged out successfully');
  setTimeout(() => window.location.href = 'index.html', 600);
}

// ---- INQUIRE ----
function inquireProduct(name) {
  window.location.href = `index.html#contact`;
  showToast(`Inquiry for "${name}" — fill out the contact form!`);
}

// ---- CONTACT FORM ----
function submitContact(e) {
  e.preventDefault();
  showToast('Message sent! We\'ll get back to you shortly.');
  e.target.reset();
}

// ---- NEWSLETTER ----
function subscribeNewsletter() {
  showToast('Thank you for subscribing!');
}

// ---- GUARD: Admin-only pages ----
if (window.location.pathname.includes('admin.html')) {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    alert('Admin access only. Please log in as admin.');
    window.location.href = 'login.html';
  }
}

// ---- ANIMATIONS ----
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});