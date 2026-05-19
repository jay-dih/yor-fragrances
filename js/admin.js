// ===== ADMIN.JS =====

function showAdminTab(tab, btn) {
  document
    .querySelectorAll(".admin-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".admin-nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("tab-" + tab)?.classList.add("active");
  if (btn) btn.classList.add("active");

  if (tab === "products") renderProductsTable();
  if (tab === "orders") renderOrdersTable();
  if (tab === "users") renderUsersTable();
  if (tab === "dashboard") renderDashboard();
  if (tab === "inquiries") renderInquiriesTable();
}

async function renderDashboard() {
  const products = await getProducts();
  const orders = await getOrders();
  const users = await getUsers();

  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-orders').textContent = orders.length;
  document.getElementById('stat-users').textContent = users.length;

  // Monthly sales: sum totals for orders this month with status Confirmed/Shipped/Completed
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthlyOrders = (orders.orders || orders).filter(o => {
    if (!o.order_date) return false;
    const d = new Date(o.order_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      && ['Confirmed','Shipped','Completed'].includes(o.status);
  });
  const monthlySales = monthlyOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const monthName = now.toLocaleString('default', { month: 'long' });
  document.getElementById('stat-monthly-sales').textContent = `₱${monthlySales.toLocaleString()}`;
  document.getElementById('stat-monthly-label').textContent = `${monthName} ${thisYear}`;

  // Category chart
  const cats = { women: 0, men: 0, unisex: 0 };
  products.forEach(p => { if (cats[p.category] !== undefined) cats[p.category]++; });
  const max = Math.max(...Object.values(cats));
  const chart = document.getElementById('categoryChart');
  if (chart) {
    chart.innerHTML = Object.entries(cats).map(([cat, count]) => `
      <div class="chart-bar-wrap">
        <span class="chart-bar-val">${count}</span>
        <div class="chart-bar" style="height:${max > 0 ? (count / max) * 80 : 0}px"></div>
        <span class="chart-bar-label">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
      </div>`).join('');
  }

  // Top products by lowest stock
  const sorted = [...products].sort((a, b) => a.stock - b.stock).slice(0, 5);
  const topEl = document.getElementById('topProducts');
  if (topEl) {
    topEl.innerHTML = sorted.map((p, i) => `
      <div class="top-product-row">
        <strong>#${i + 1} ${p.name}</strong>
        <span>${p.category} · ₱${p.price.toLocaleString()}</span>
        <span>${p.stock} in stock</span>
      </div>`).join('');
  }
}

async function renderProductsTable() {
  const products = await getProducts();
  const tbody = document.getElementById("productsTableBody");
  if (!tbody) return;
  tbody.innerHTML = products
    .map(
      (p) => `
    <tr>
      <td><img src="${p.image}" alt="${p.name}" onerror="this.src=''; this.style.background='var(--sand-light)'"/></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.category}</td>
      <td>₱${p.price.toLocaleString()}</td>
      <td>${p.stock}</td>
      <td><span class="badge ${p.featured ? "badge-yes" : "badge-no"}">${p.featured ? "Yes" : "No"}</span></td>
      <td>
        <button class="btn-edit" onclick="openProductModal(${p.id})">Edit</button>
        <button class="btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

async function renderOrdersTable() {
  const res = await apiFetch('orders.php');
  const orders = (res && res.orders) ? res.orders : [];
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-light);">No orders yet.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer_name}</td>
      <td style="max-width:180px; font-size:0.8rem;">${o.items_summary}</td>
      <td>₱${parseFloat(o.total).toLocaleString()}</td>
      <td>${o.payment_method === 'GCash' ? '<span style="color:#1A75FF;font-weight:500;">GCash</span>' : 'COD'}</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td>${o.order_date}</td>
      <td>
        <button class="btn-edit" onclick='openOrderReview(${JSON.stringify(o)})'>Review</button>
      </td>
    </tr>`).join('');
}

async function renderUsersTable() {
  const users = await getUsers();
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  tbody.innerHTML = users
    .map(
      (u) => `
    <tr>
      <td><strong>${u.username}</strong></td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td><span class="badge ${u.role === "admin" ? "badge-yes" : "badge-no"}">${u.role}</span></td>
      <td>${u.registered}</td>
      <td>
        <button class="btn-delete" onclick="deleteUser('${u.username}')">Delete</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

// ---- PRODUCT MODAL ----
async function openProductModal(id) {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  // Reset file input & preview
  document.getElementById('pImageFile').value = '';
  document.getElementById('productImagePreview').style.display = 'none';

  if (id) {
    const products = await getProducts();
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('editProductId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pStock').value = p.stock;
    document.getElementById('pDesc').value = p.description || '';
    document.getElementById('pFeatured').checked = p.featured;
    if (p.image) {
      document.getElementById('currentProductImg').src = p.image;
      document.getElementById('productImagePreview').style.display = 'block';
    }
  } else {
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('editProductId').value = '';
    document.querySelector('.modal-form').reset();
  }
  modal.classList.add('open');
}

function previewProductImage(input) {
  if (!input.files.length) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('currentProductImg').src = e.target.result;
    document.getElementById('productImagePreview').style.display = 'block';
  };
  reader.readAsDataURL(input.files[0]);
}

function closeProductModal() {
  document.getElementById('productModal')?.classList.remove('open');
}

async function saveProduct(e) {
  e.preventDefault();
  const editId = document.getElementById('editProductId').value;
  const fileInput = document.getElementById('pImageFile');

  if (fileInput.files.length > 0) {
    // New image chosen: send as multipart
    const fd = new FormData();
    fd.append('name', document.getElementById('pName').value.trim());
    fd.append('category', document.getElementById('pCategory').value);
    fd.append('price', document.getElementById('pPrice').value);
    fd.append('stock', document.getElementById('pStock').value);
    fd.append('description', document.getElementById('pDesc').value.trim());
    fd.append('featured', document.getElementById('pFeatured').checked ? '1' : '0');
    fd.append('product_image', fileInput.files[0]);
    if (editId) fd.append('id', editId);
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(`api/products.php${editId ? '?id=' + editId : ''}`, { method, body: fd }).then(r => r.json()).catch(() => null);
    if (res && res.success) { showToast(editId ? 'Product updated!' : 'Product added!'); }
    else showToast('Error saving product');
  } else {
    // No new image, use JSON
    const data = {
      name: document.getElementById('pName').value.trim(),
      category: document.getElementById('pCategory').value,
      price: Number(document.getElementById('pPrice').value),
      stock: Number(document.getElementById('pStock').value),
      description: document.getElementById('pDesc').value.trim(),
      featured: document.getElementById('pFeatured').checked,
    };
    if (editId) {
      data.id = Number(editId);
      await updateProduct(data);
      showToast('Product updated!');
    } else {
      await addProduct(data);
      showToast('Product added!');
    }
  }

  closeProductModal();
  renderProductsTable();
  renderDashboard();
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  await deleteProductApi(id);
  renderProductsTable();
  renderDashboard();
  showToast("Product deleted");
}

// ---- ORDER REVIEW MODAL ----
function openOrderReview(order) {
  document.getElementById('orderReviewId').value = order.id;
  document.getElementById('orderReviewStatus').value = order.status;
  document.getElementById('orderReviewRemarks').value = order.admin_remarks || '';
  document.getElementById('orderReviewDetails').innerHTML = `
    <div style="margin-bottom:8px;"><strong>Order:</strong> ${order.id}</div>
    <div style="margin-bottom:8px;"><strong>Customer:</strong> ${order.customer_name}</div>
    <div style="margin-bottom:8px;"><strong>Items:</strong> ${order.items_summary}</div>
    <div style="margin-bottom:8px;"><strong>Total:</strong> ₱${parseFloat(order.total).toLocaleString()}</div>
    <div><strong>Payment:</strong> ${order.payment_method || 'COD'} &nbsp;
      <span class="status-badge status-${order.status}">${order.status}</span>
    </div>`;

  const receiptSection = document.getElementById('orderReceiptSection');
  if (order.payment_receipt) {
    document.getElementById('orderReceiptImg').src = order.payment_receipt;
    receiptSection.style.display = 'block';
  } else {
    receiptSection.style.display = 'none';
  }
  document.getElementById('orderReviewModal').classList.add('open');
}

function closeOrderReviewModal() {
  document.getElementById('orderReviewModal')?.classList.remove('open');
}

async function submitOrderReview() {
  const id = document.getElementById('orderReviewId').value;
  const status = document.getElementById('orderReviewStatus').value;
  const remarks = document.getElementById('orderReviewRemarks').value.trim();
  const res = await apiFetch('orders.php', {
    method: 'PUT',
    body: JSON.stringify({ id, status, admin_remarks: remarks })
  });
  if (res && res.success) {
    closeOrderReviewModal();
    renderOrdersTable();
    showToast(`Order ${id} updated to "${status}"`);
  } else {
    showToast('Failed to update order');
  }
}

async function updateOrderStatus(id, status) {
  const res = await apiFetch('orders.php', { method: 'PUT', body: JSON.stringify({ id, status }) });
  if (res && res.success) showToast(`Order ${id} marked as ${status}`);
  else showToast('Failed to update order status');
}

// ---- USERS MGT ----
async function deleteUser(username) {
  const currentUser = getCurrentUser();
  if (currentUser.username === username) {
    alert("You cannot delete your own admin account while logged in.");
    return;
  }
  if (!confirm(`Are you sure you want to delete user '${username}'?`)) return;
  
  await deleteUserApi(username);
  renderUsersTable();
  renderDashboard();
  showToast("User deleted successfully");
}

function openUserModal() {
  const modal = document.getElementById("userModal");
  if (!modal) return;
  document.querySelector("#userModal .modal-form").reset();
  modal.classList.add("open");
}

function closeUserModal() {
  document.getElementById("userModal")?.classList.remove("open");
}

async function saveAdminUser(e) {
  e.preventDefault();
  
  const res = await apiFetch('auth.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'register',
      username: document.getElementById("uUsername").value.trim(),
      email: document.getElementById("uEmail").value.trim(),
      name: document.getElementById("uName").value.trim(),
      password: document.getElementById("uPassword").value,
      role: 'admin'
    })
  });

  if (res && res.success) {
    closeUserModal();
    renderUsersTable();
    renderDashboard();
    showToast("Admin user created successfully!");
  } else {
    showToast(res?.error || "Failed to create user");
  }
}

// ---- INIT ----
renderDashboard();

async function renderInquiriesTable() {
  const inquiries = await getInquiries();
  const tbody = document.getElementById("inquiriesTableBody");
  if (!tbody) return;
  
  if (inquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-light);">No inquiries yet.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = inquiries
    .map(
      (iq) => `
    <tr>
      <td style="white-space:nowrap;">${iq.inquiry_date}</td>
      <td><strong>${iq.name}</strong></td>
      <td>${iq.contact}</td>
      <td style="max-width:300px; font-size:0.85rem;">${iq.message}</td>
    </tr>
  `
    )
    .join("");
}
