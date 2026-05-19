// ===== DATA LAYER (API INTEGRATION) =====

const API_BASE = 'api/';

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(API_BASE + endpoint, options);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    return null;
  }
}

// PRODUCTS
async function getProducts(category = 'all') {
  const url = category && category !== 'all' ? `products.php?category=${category}` : `products.php`;
  const data = await apiFetch(url);
  return data || [];
}

async function addProduct(product) {
  return await apiFetch('products.php', { method: 'POST', body: JSON.stringify(product) });
}

async function updateProduct(product) {
  return await apiFetch('products.php', { method: 'PUT', body: JSON.stringify(product) });
}

async function deleteProductApi(id) {
  return await apiFetch(`products.php?id=${id}`, { method: 'DELETE' });
}

// USERS
async function getUsers() {
  const data = await apiFetch('users.php');
  return data || [];
}

async function deleteUserApi(username) {
  return await apiFetch(`users.php?username=${username}`, { method: 'DELETE' });
}

// ORDERS
async function getOrders() {
  const data = await apiFetch('orders.php');
  return data || [];
}

async function updateOrderStatusApi(id, status) {
  return await apiFetch('orders.php', { method: 'PUT', body: JSON.stringify({id, status}) });
}

// INQUIRIES
async function getInquiries() {
  const data = await apiFetch('inquiries.php');
  return data || [];
}

// LOCAL STORAGE HELPERS (For persistent client-side state)
function getCart() {
  return JSON.parse(localStorage.getItem("yor_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("yor_cart", JSON.stringify(cart));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("yor_current_user") || "null");
}

function setCurrentUser(user) {
  if (user) localStorage.setItem("yor_current_user", JSON.stringify(user));
  else localStorage.removeItem("yor_current_user");
}
