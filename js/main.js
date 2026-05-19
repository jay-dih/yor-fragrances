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
      ${user.role === 'admin' ? '<a href="admin.html">⚙️ Admin Panel</a>' : '<a href="my-orders.html">📦 My Orders</a>'}
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

// ---- PRODUCT QUICK VIEW MODAL ----
async function openQuickView(id) {
  const products = await getProducts();
  const p = products.find(pr => pr.id === id);
  if (!p) return;
  
  document.getElementById('qvImage').src = p.image;
  document.getElementById('qvCategory').textContent = p.category + "'S";
  document.getElementById('qvTitle').textContent = p.name;
  document.getElementById('qvPrice').textContent = `₱${p.price.toLocaleString()}.00`;
  document.getElementById('qvDesc').textContent = p.description || 'A uniquely crafted YOR original fragrance.';
  document.getElementById('qvNotes').textContent = p.notes || 'Blend';
  
  const addBtn = document.getElementById('qvAddBtn');
  addBtn.onclick = () => {
    addToCart(p.id, 1);
    closeQuickView();
  };
  
  const wlBtn = document.getElementById('qvWishlistBtn');
  wlBtn.onclick = () => toggleWishlist(p.id, wlBtn);
  
  // Check wishlist status
  const inWishlist = await checkWishlistStatus(p.id);
  if(inWishlist) wlBtn.classList.add('active');
  else wlBtn.classList.remove('active');
  
  // Fetch Reviews
  const revRes = await apiFetch(`reviews.php?product_id=${p.id}`);
  let reviewHtml = '';
  if(revRes && revRes.success && revRes.reviews.length > 0) {
    const avg = revRes.reviews.reduce((s, r) => s + parseInt(r.rating), 0) / revRes.reviews.length;
    reviewHtml = `★`.repeat(Math.round(avg)) + `☆`.repeat(5 - Math.round(avg)) + 
      ` <span style="color:var(--text-light); font-size:0.8rem;">(${revRes.reviews.length} Reviews)</span>`;
  } else {
    reviewHtml = `★★★★★ <span style="color:var(--text-light); font-size:0.8rem;">(0 Reviews)</span>`;
  }
  document.getElementById('qvRating').innerHTML = reviewHtml;
  
  document.getElementById('qvModal')?.classList.add('open');
}

function closeQuickView() {
  document.getElementById('qvModal')?.classList.remove('open');
}

// Keep old openProductDetail for backward compatibility or routing to a detail page if needed,
// but for shop.html we'll swap the click handler to openQuickView.
function openProductDetail(id) {
  openQuickView(id);
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
function toggleCartDrawer(e) {
  if (e) e.preventDefault();
  document.getElementById('cartDrawer')?.classList.toggle('open');
  document.getElementById('cartOverlay')?.classList.toggle('open');
  if (document.getElementById('cartDrawer')?.classList.contains('open')) {
    renderCart(); // Re-render when opening
  }
}

async function addToCart(productId, qty = 1) {
  const products = await getProducts();
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
  renderCart(); // Update drawer
  showToast(`"${p.name}" added to cart`);
  
  // Auto-open drawer on add
  if (!document.getElementById('cartDrawer')?.classList.contains('open')) {
    toggleCartDrawer();
  }
}

function renderCart() {
  const cart = getCart();
  const itemsEl = document.getElementById('cartDrawerItems') || document.getElementById('cartItems');
  const summaryEl = document.getElementById('cartDrawerSummary') || document.getElementById('cartSummary');
  if (!itemsEl || !summaryEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><p style="color:var(--text-light); text-align:center; margin-top:40px;">Your cart is empty.</p></div>`;
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
      <div class="cart-item" style="padding:16px 0; border-bottom:1px solid var(--sand-light);">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:16px;">
          <input type="checkbox" class="custom-checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCartSelection(${item.id})" />
          <img src="${item.image}" alt="${item.name}" style="width:60px; height:60px; object-fit:contain; background:var(--cream); border-radius:4px;" onerror="this.src=''; this.style.background='var(--sand-light)'"/>
          <div class="cart-item-info" style="flex:1;">
            <h4 style="font-size:0.9rem; margin-bottom:4px;">${item.name}</h4>
            <p style="font-size:0.8rem; color:var(--text-light);">₱${item.price.toLocaleString()}.00</p>
          </div>
          <div style="text-align:right;">
            <p style="font-weight:500; font-size:0.95rem; margin-bottom:8px;">₱${(item.price * item.qty).toLocaleString()}.00</p>
            <div class="cart-item-qty" style="display:inline-flex; border:1px solid var(--sand); border-radius:4px; overflow:hidden;">
              <button style="border:none; background:none; padding:4px 8px;" onclick="updateCartQty(${item.id}, -1)">−</button>
              <span style="padding:4px 8px; font-size:0.85rem;">${item.qty}</span>
              <button style="border:none; background:none; padding:4px 8px;" onclick="updateCartQty(${item.id}, 1)">+</button>
            </div>
            <button style="display:block; border:none; background:none; color:red; font-size:0.75rem; margin-top:8px; cursor:pointer;" onclick="removeFromCart(${item.id})">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  itemsEl.innerHTML = html;

  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 100;
  summaryEl.innerHTML = `
    <div style="margin-bottom:16px;">
      <div class="summary-row" style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem; color:var(--text-light);"><span>Subtotal</span><span>₱${subtotal.toLocaleString()}.00</span></div>
      <div class="summary-row" style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem; color:var(--text-light);"><span>Shipping</span><span>${shipping === 0 ? 'Free' : '₱' + shipping}</span></div>
      <div class="summary-row total" style="display:flex; justify-content:space-between; margin-top:16px; padding-top:16px; border-top:1px solid var(--sand); font-weight:500; font-size:1.1rem; color:var(--dark);"><span>Total</span><span>₱${(subtotal + shipping).toLocaleString()}.00</span></div>
    </div>
    <button class="btn-primary" style="width:100%;" onclick="checkout()">Secure Checkout</button>
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

// ---- CHECKOUT & PAYMENT MODAL ----
let _checkoutItems = [];
let _selectedPayment = null;

function checkout() {
  const user = getCurrentUser();
  if (!user) { openCheckoutAuthModal(); return; }
  const cart = getCart();
  _checkoutItems = cart.filter(i => i.selected !== false);
  if (_checkoutItems.length === 0) { showToast('Please select at least one item.'); return; }

  // Build summary
  const total = _checkoutItems.reduce((s, i) => s + i.price * i.qty, 0);
  const summaryEl = document.getElementById('paymentSummary');
  if (summaryEl) {
    summaryEl.innerHTML = _checkoutItems.map(i =>
      `<div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span>${i.name} × ${i.qty}</span><span>₱${(i.price * i.qty).toLocaleString()}</span>
      </div>`
    ).join('') + `<div style="border-top:1px solid var(--sand);margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;font-weight:500;">
      <span>Total</span><span>₱${total.toLocaleString()}</span></div>`;
  }

  _selectedPayment = null;
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  const gcash = document.getElementById('gcashFlow');
  const cod   = document.getElementById('codFlow');
  const btn   = document.getElementById('confirmPaymentBtn');
  if (gcash) gcash.style.display = 'none';
  if (cod) cod.style.display = 'none';
  if (btn) btn.style.display = 'none';

  const modal = document.getElementById('paymentModal');
  if (modal) modal.classList.add('open');
}

function selectPayment(method) {
  _selectedPayment = method;
  document.getElementById('optCOD')?.classList.toggle('selected', method === 'COD');
  document.getElementById('optGCash')?.classList.toggle('selected', method === 'GCash');
  document.getElementById('gcashFlow').style.display = method === 'GCash' ? 'block' : 'none';
  document.getElementById('codFlow').style.display   = method === 'COD'   ? 'block' : 'none';
  document.getElementById('confirmPaymentBtn').style.display = 'block';
}

function previewReceipt(input) {
  if (!input.files.length) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('receiptImg').src = e.target.result;
    document.getElementById('receiptPreview').style.display = 'block';
  };
  reader.readAsDataURL(input.files[0]);
}

async function confirmPayment() {
  const user = getCurrentUser();
  if (!user || !_selectedPayment) return;

  const total = _checkoutItems.reduce((s, i) => s + i.price * i.qty, 0);
  const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
  const date = new Date().toISOString().split('T')[0];
  const itemsStr = _checkoutItems.map(i => `${i.name} x${i.qty}`).join(', ');
  const btn = document.getElementById('confirmPaymentBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Placing Order...'; }

  let res;
  if (_selectedPayment === 'GCash') {
    const fileInput = document.getElementById('receiptUpload');
    if (!fileInput.files.length) {
      showToast('Please upload your GCash receipt screenshot.');
      if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
      return;
    }
    const fd = new FormData();
    fd.append('id', orderId);
    fd.append('customer', user.name);
    fd.append('items', itemsStr);
    fd.append('total', total);
    fd.append('payment_method', 'GCash');
    fd.append('date', date);
    fd.append('receipt', fileInput.files[0]);
    res = await fetch('api/orders.php', { method: 'POST', body: fd }).then(r => r.json()).catch(() => null);
  } else {
    const address = document.getElementById('deliveryAddress')?.value.trim();
    if (!address) { showToast('Please enter a delivery address.'); if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; } return; }
    res = await apiFetch('orders.php', {
      method: 'POST',
      body: JSON.stringify({ id: orderId, customer: user.name, items: itemsStr, total, payment_method: 'COD', date })
    });
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
  if (res && res.success) {
    const remaining = getCart().filter(i => i.selected === false);
    saveCart(remaining);
    updateCartCount();
    closePaymentModal();
    showToast('Order placed! We\'ll review and confirm your order shortly.');
    setTimeout(() => { renderCart(); }, 600);
  } else {
    showToast('Failed to place order. Please try again.');
  }
}

function closePaymentModal() {
  document.getElementById('paymentModal')?.classList.remove('open');
}

function openCheckoutAuthModal() {
  const modal = document.getElementById('checkoutAuthModal');
  if (modal) modal.classList.add('open');
}

function closeCheckoutAuthModal() {
  const modal = document.getElementById('checkoutAuthModal');
  if (modal) modal.classList.remove('open');
}


// ---- SEARCH ----
let searchTimeout;
async function handleSearch(val) {
  clearTimeout(searchTimeout);
  if (!val.trim()) { hideSearchDropdown(); return; }
  
  searchTimeout = setTimeout(async () => {
    const products = await getProducts();
    const results = products.filter(p =>
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

async function applyFilters() {
  let products = await getProducts(activeCategory === 'all' ? null : activeCategory);
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
async function loadMore() {
  const products = await getProducts(activeCategory === 'all' ? null : activeCategory);
  loadedCount = Math.min(loadedCount + 4, products.length);
  renderProducts('productsGrid', products.slice(0, loadedCount));
  if (loadedCount >= products.length) {
    document.getElementById('loadMoreBtn').style.display = 'none';
  }
}

// ---- AUTH ----
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  
  const res = await apiFetch('auth.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'login', username, password })
  });

  if (res && res.success) {
    setCurrentUser(res.user);
    showToast(`Welcome back, ${res.user.name}!`);
    setTimeout(() => {
      window.location.href = res.user.role === 'admin' ? 'admin.html' : 'index.html';
    }, 800);
  } else {
    showToast(res?.error || 'Login failed');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('regName').value.trim();
  const username = document.getElementById('regUser').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password  = document.getElementById('regPass').value;
  const conf  = document.getElementById('regPassConfirm').value;

  if (password !== conf) { showToast('Passwords do not match'); return; }

  const res = await apiFetch('auth.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'register', username, email, password, name, role: 'user' })
  });

  if (res && res.success) {
    setCurrentUser(res.user);
    showToast('Account created! Welcome to YOR Fragrances.');
    setTimeout(() => window.location.href = 'index.html', 900);
  } else {
    showToast(res?.error || 'Registration failed');
  }
}

function logoutUser() {
  setCurrentUser(null);
  showToast('Logged out successfully');
  setTimeout(() => window.location.href = 'index.html', 600);
}

// ---- WISHLIST API ----
async function checkWishlistStatus(productId) {
  const user = getCurrentUser();
  if(!user) return false;
  const res = await apiFetch('wishlist.php');
  if(res && res.success) {
    return res.wishlist.some(item => item.id == productId);
  }
  return false;
}

async function toggleWishlist(productId, btn) {
  const user = getCurrentUser();
  if(!user) {
    showToast('Please log in to save to wishlist.');
    return;
  }
  const isActive = btn.classList.contains('active');
  const res = await apiFetch('wishlist.php', {
    method: isActive ? 'DELETE' : 'POST',
    body: JSON.stringify({ product_id: productId })
  });
  if(res && res.success) {
    btn.classList.toggle('active');
    showToast(isActive ? 'Removed from wishlist' : 'Added to wishlist');
  } else {
    showToast('Wishlist action failed.');
  }
}

// ---- INQUIRE ----
function inquireProduct(name) {
  window.location.href = `index.html#contact`;
  showToast(`Inquiry for "${name}" — fill out the contact form!`);
}

// ---- CONTACT FORM ----
async function submitContact(e) {
  e.preventDefault();
  const name = document.getElementById("contactName")?.value.trim();
  const info = document.getElementById("contactInfo")?.value.trim();
  const message = document.getElementById("contactMessage")?.value.trim();
  
  if(name && info && message) {
    const res = await apiFetch('inquiries.php', {
      method: 'POST',
      body: JSON.stringify({ name, contact: info, message, date: new Date().toISOString().split("T")[0] })
    });
    if (res && res.success) {
      showToast('Message sent! We\'ll get back to you shortly.');
      e.target.reset();
    } else {
      showToast('Failed to send message.');
    }
  }
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
      entry.target.classList.add('visible'); // For reveal-up
      entry.target.classList.add('fade-in-visible'); // For legacy fade-in
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in, .reveal-up').forEach(el => observer.observe(el));
});