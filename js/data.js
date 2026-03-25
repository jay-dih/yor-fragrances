// ===== DATA LAYER =====
// Products are stored here. In a real system, this comes from a database.
// To add/change products, use the admin panel (admin.html) and it saves to localStorage.

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Rose Velvet",
    category: "women",
    price: 850,
    stock: 20,
    featured: true,
    description:
      "A rich, velvety blend of Turkish rose, soft musk, and warm sandalwood. Perfect for evenings and special occasions.",
    image: "js/about.jpg",
  },
  {
    id: 2,
    name: "Amber Dusk",
    category: "women",
    price: 720,
    stock: 15,
    featured: false,
    description:
      "Sweet amber heart notes with vanilla base and hints of jasmine. A warm and comforting scent for daily wear.",
    image: "js/about.jpg",
  },

  {
    id: 3,
    name: "Ocean Noir",
    category: "men",
    price: 950,
    stock: 12,
    featured: true,
    description:
      "Bold and fresh – crisp aquatic top notes with dark cedar and vetiver base. A confident, modern masculine scent.",
    image: "js/about.jpg",
  },
  {
    id: 4,
    name: "Cedar & Smoke",
    category: "men",
    price: 1100,
    stock: 8,
    featured: false,
    description:
      "A brooding blend of smoked cedar, leather accord, and a hint of black pepper. For the bold and distinguished.",
    image: "js/about.jpg",
  },
  {
    id: 5,
    name: "Citrus Bloom",
    category: "unisex",
    price: 650,
    stock: 25,
    featured: false,
    description:
      "Light and uplifting. Fresh bergamot and lemon zest over a floral heart of white peony. Great for daytime.",
    image: "js/about.jpg",
  },
  {
    id: 6,
    name: "Midnight Oud",
    category: "unisex",
    price: 1400,
    stock: 6,
    featured: true,
    description:
      "A bold oud-based perfume with earthy richness and exotic depth. Long-lasting and deeply impactful.",
    image: "js/about.jpg",
  },
  {
    id: 7,
    name: "Peach Whisper",
    category: "women",
    price: 580,
    stock: 18,
    featured: false,
    description:
      "Sweet, delicate peach blossoms and fresh apricot with a light musky dry down. Youthful and playful.",
    image: "js/about.jpg",
  },
  {
    id: 8,
    name: "Green Forest",
    category: "men",
    price: 780,
    stock: 14,
    featured: false,
    description:
      "Earthy ferns, pine needles, and green moss. A fresh and grounding fragrance inspired by nature.",
    image: "js/about.jpg",
  },
  {
    id: 9,
    name: "Vanilla Soleil",
    category: "unisex",
    price: 690,
    stock: 22,
    featured: true,
    description:
      "A warm, sun-kissed vanilla with coconut milk and soft florals. Cheerful, cozy, and universally loved.",
    image: "js/about.jpg",
  },
  {
    id: 10,
    name: "Iris Garden",
    category: "women",
    price: 880,
    stock: 10,
    featured: false,
    description:
      "Powdery iris with violet leaf and pale wood. Sophisticated, clean, and effortlessly elegant.",
    image: "js/about.jpg",
  },
  {
    id: 11,
    name: "Spiced Tobacco",
    category: "men",
    price: 1250,
    stock: 7,
    featured: false,
    description:
      "Warm tobacco leaf, spiced with cardamom and cinnamon. Rich and addictive – a statement fragrance.",
    image: "js/about.jpg",
  },
  {
    id: 12,
    name: "White Musk",
    category: "unisex",
    price: 550,
    stock: 30,
    featured: false,
    description:
      "Clean, soft white musk over a sheer floral base. The ultimate everyday scent – subtle and addicting.",
    image: "js/about.jpg",
  },
];

const DEFAULT_USERS = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "YOR Admin",
    email: "admin@yorfragrances.com",
    role: "admin",
    registered: "2025-01-01",
  },
  {
    id: 2,
    username: "user",
    password: "user123",
    name: "Sample User",
    email: "user@example.com",
    role: "user",
    registered: "2025-03-10",
  },
];

const DEFAULT_ORDERS = [
  {
    id: "ORD-001",
    customer: "Sample User",
    items: "Rose Velvet x1, White Musk x2",
    total: 1950,
    status: "Pending",
    date: "2025-06-01",
  },
  {
    id: "ORD-002",
    customer: "Guest",
    items: "Ocean Noir x1",
    total: 950,
    status: "Confirmed",
    date: "2025-06-03",
  },
  {
    id: "ORD-003",
    customer: "Sample User",
    items: "Midnight Oud x1",
    total: 1400,
    status: "Confirmed",
    date: "2025-06-04",
  },
];

// ===== STORAGE HELPERS =====
function initData() {
  // Always reset to DEFAULT_PRODUCTS to ensure latest data
  localStorage.setItem("yor_products", JSON.stringify(DEFAULT_PRODUCTS));

  if (!localStorage.getItem("yor_users")) {
    localStorage.setItem("yor_users", JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem("yor_orders")) {
    localStorage.setItem("yor_orders", JSON.stringify(DEFAULT_ORDERS));
  }
}

function getProducts(category) {
  initData();
  let products = JSON.parse(localStorage.getItem("yor_products"));
  if (category && category !== "all")
    products = products.filter((p) => p.category === category);
  return products;
}

function saveProducts(products) {
  localStorage.setItem("yor_products", JSON.stringify(products));
}

function getUsers() {
  initData();
  return JSON.parse(localStorage.getItem("yor_users"));
}

function saveUsers(users) {
  localStorage.setItem("yor_users", JSON.stringify(users));
}

function getOrders() {
  initData();
  return JSON.parse(localStorage.getItem("yor_orders"));
}

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

// ===== INIT =====
initData();
