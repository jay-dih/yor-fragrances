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
}

function renderDashboard() {
  const products = getProducts();
  const orders = getOrders();
  const users = getUsers();

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

function renderProductsTable() {
  const products = getProducts();
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

function renderOrdersTable() {
  const orders = getOrders();
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;
  tbody.innerHTML = orders
    .map(
      (o) => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer}</td>
      <td style="max-width:220px;font-size:0.8rem">${o.items}</td>
      <td>₱${o.total.toLocaleString()}</td>
      <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
      <td>${o.date}</td>
    </tr>
  `,
    )
    .join("");
}

function renderUsersTable() {
  const users = getUsers();
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
    </tr>
  `,
    )
    .join("");
}

// ---- PRODUCT MODAL ----
function openProductModal(id) {
  const modal = document.getElementById("productModal");
  if (!modal) return;

  if (id) {
    const p = getProducts().find((pr) => pr.id === id);
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

function saveProduct(e) {
  e.preventDefault();
  const products = getProducts();
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
    const idx = products.findIndex((p) => p.id === Number(editId));
    if (idx !== -1) products[idx] = { ...products[idx], ...data };
    showToast("Product updated!");
  } else {
    data.id = Date.now();
    products.push(data);
    showToast("Product added!");
  }

  saveProducts(products);
  closeProductModal();
  renderProductsTable();
  renderDashboard();
}

function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
  renderProductsTable();
  renderDashboard();
  showToast("Product deleted");
}

// ---- INIT ----
renderDashboard();
