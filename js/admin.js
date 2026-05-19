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

  document.getElementById("stat-products").textContent = products.length;
  document.getElementById("stat-orders").textContent = orders.length;
  document.getElementById("stat-users").textContent = users.length;

  // Category chart
  const cats = { women: 0, men: 0, unisex: 0 };
  products.forEach((p) => {
    if (cats[p.category] !== undefined) cats[p.category]++;
  });
  const max = Math.max(...Object.values(cats));
  const chart = document.getElementById("categoryChart");
  if (chart) {
    chart.innerHTML = Object.entries(cats)
      .map(
        ([cat, count]) => `
      <div class="chart-bar-wrap">
        <span class="chart-bar-val">${count}</span>
        <div class="chart-bar" style="height:${max > 0 ? (count / max) * 80 : 0}px"></div>
        <span class="chart-bar-label">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
      </div>
    `,
      )
      .join("");
  }

  // Top products (by stock-sold proxy: lower stock = more popular)
  const sorted = [...products].sort((a, b) => a.stock - b.stock).slice(0, 5);
  const topEl = document.getElementById("topProducts");
  if (topEl) {
    topEl.innerHTML = sorted
      .map(
        (p, i) => `
      <div class="top-product-row">
        <strong>#${i + 1} ${p.name}</strong>
        <span>${p.category} · ₱${p.price.toLocaleString()}</span>
        <span>${p.stock} in stock</span>
      </div>
    `,
      )
      .join("");
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
  const orders = await getOrders();
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;
  tbody.innerHTML = orders
    .map(
      (o) => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer_name}</td>
      <td style="max-width:220px;font-size:0.8rem">${o.items_summary}</td>
      <td>₱${parseFloat(o.total).toLocaleString()}</td>
      <td>
        <select style="padding:4px; font-size:0.8rem; border:1px solid var(--sand); border-radius:2px; cursor:pointer;" onchange="updateOrderStatus('${o.id}', this.value)">
          <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>${o.order_date}</td>
    </tr>
  `,
    )
    .join("");
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
  const modal = document.getElementById("productModal");
  if (!modal) return;

  if (id) {
    const products = await getProducts();
    const p = products.find((pr) => pr.id === id);
    if (!p) return;
    document.getElementById("modalTitle").textContent = "Edit Product";
    document.getElementById("editProductId").value = p.id;
    document.getElementById("pName").value = p.name;
    document.getElementById("pCategory").value = p.category;
    document.getElementById("pPrice").value = p.price;
    document.getElementById("pStock").value = p.stock;
    document.getElementById("pDesc").value = p.description || "";
    document.getElementById("pImage").value = p.image || "";
    document.getElementById("pFeatured").checked = p.featured;
  } else {
    document.getElementById("modalTitle").textContent = "Add Product";
    document.getElementById("editProductId").value = "";
    document.querySelector(".modal-form").reset();
  }
  modal.classList.add("open");
}

function closeProductModal() {
  document.getElementById("productModal")?.classList.remove("open");
}

async function saveProduct(e) {
  e.preventDefault();
  const editId = document.getElementById("editProductId").value;

  const data = {
    name: document.getElementById("pName").value.trim(),
    category: document.getElementById("pCategory").value,
    price: Number(document.getElementById("pPrice").value),
    stock: Number(document.getElementById("pStock").value),
    description: document.getElementById("pDesc").value.trim(),
    image:
      document.getElementById("pImage").value.trim() ||
      "assets/images/placeholder.jpg",
    featured: document.getElementById("pFeatured").checked,
  };

  if (editId) {
    data.id = Number(editId);
    await updateProduct(data);
    showToast("Product updated!");
  } else {
    await addProduct(data);
    showToast("Product added!");
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

// ---- ORDERS MGT ----
async function updateOrderStatus(id, status) {
  const res = await updateOrderStatusApi(id, status);
  if (res && res.success) {
    showToast(`Order ${id} marked as ${status}`);
  } else {
    showToast(`Failed to update order status`);
  }
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
