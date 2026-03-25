YOR Fragrances — Use Cases & Site Documentation

Purpose

- Describe features, expected behaviors, and role-based interactions for the YOR Fragrances website.
- Provide practical how-to and troubleshooting notes for the owner, admin, or developer.

Tone & format

- Concise, action-oriented, step lists and short examples (matches your prompt style).

---

SUMMARY OF PAGES & COMPONENTS

- index.html (Home): hero banner, category tabs, featured products, mid-banner, about, contact, newsletter, footer.
- shop.html (Shop): product grid, category tabs, filters, sort, load more.
- cart.html (Cart): cart items, qty controls, remove pill button, order summary.
- login.html / register.html: auth pages.
- admin.html: dashboard (stats, category breakdown), products table (CRUD), users, orders.
- Shared components: `navbar` (logo, search, cart count, user menu), `mobile-menu`, `toast`, `modal`.

ROLES & CAPABILITIES

1. Guest / Shopper

- Browse products, use search, see product details (modal).
- Add to cart, change qty, remove items.
- Place order / send inquiry (creates a demo order entry in localStorage).
- Subscribe to newsletter via footer.

2. Registered User

- Everything guest can do.
- Cart persists via `yor_cart` localStorage.
- Login/Register sets `yor_current_user` in localStorage.

3. Admin

- Access `admin.html`.
- Dashboard shows counts: total products, orders, users, categories.
- Category breakdown chart shows counts per category.
- Manage products: Add, Edit, Delete (image path, name, category, price, stock, featured, description).
- Manage users and view orders (demo view only).

INTERACTIVE ELEMENTS — EXPECTED BEHAVIOR

- Navbar
  - Search input: on typing shows suggested matches (searchDropdown). Selecting a suggestion opens product detail or filters shop.
  - Cart icon: click → `cart.html`. Cart count (`#cartCount`) updates when items added/removed.
  - User icon: toggle account menu (login/register or account actions).
- Hero & Mid-banner
  - CTA: `Explore Collection` → `shop.html`.
  - Images use `object-fit: contain` (no zoom/crop). If missing, `onerror` shows fallback background.
- Category tabs
  - Click to filter (`filterCategory(category, this)`), `active` class toggles.
- Filter panel
  - Toggle `#filterPanel`. Select price or sort → `applyFilters()` updates grid.
- Product cards
  - Click card → `openProductDetail(id)` (modal).
  - Add to Cart → `addToCart(id)` updates `yor_cart` and cart count; shows toast.
  - Inquire → opens contact modal or prefills message for contact flow.
- Product detail modal
  - Qty controls + Add to Cart + Close. Adding triggers toast.
- Cart page
  - Qty `-` and `+` buttons adjust qty and totals in real time.
  - Remove button: visible pill button (red text, cream background) removes item, updates summary.
  - Place Order / Inquiry: creates an order object in `yor_orders` and shows confirmation toast in demo.
- Login/Register
  - On success set `yor_current_user` (localStorage). Admin login credentials exist by default (admin/admin123).
- Admin
  - Add product modal: must include valid `image` path reachable from pages (recommend `assets/images/<file>`).
  - Edit product: updates `yor_products` and re-renders tables, charts, dashboard counts.
  - Delete product: confirm, then remove and re-render.

DATA, STORAGE & INITIALIZATION

- LocalStorage keys used
  - `yor_products` — products array (id, name, category, price, stock, featured, description, image)
  - `yor_users` — users array
  - `yor_orders` — orders array
  - `yor_cart` — current cart for the browser
  - `yor_current_user` — currently logged-in user
- initData() behavior
  - During development this repo resets `yor_products` to defaults on load (so tests reflect latest `DEFAULT_PRODUCTS`). In production change `initData()` to only seed when keys are missing.
- Image paths
  - Use paths reachable by pages (best: `assets/images/product1.jpg`). If you store images in `js/`, reference `js/file.jpg` (works, but not recommended).
- Recommended image sizes
  - hero-banner: ≈1920×600
  - mid-banner: ≈1200×300
  - product thumbnails: 400–600px square

ERRORS & TROUBLESHOOTING

- Images 404
  - Check browser DevTools → Network for 404. Ensure `image` property in `DEFAULT_PRODUCTS` points to existing file.
  - Common mistake: placing images in a different folder (e.g., `js/about.jpg`) but using `assets/images/about.jpg` path.
- Old product paths still used
  - localStorage may contain old `yor_products`. Clear with browser console:

```js
localStorage.removeItem("yor_products");
localStorage.removeItem("yor_users");
localStorage.removeItem("yor_orders");
localStorage.removeItem("yor_cart");
localStorage.removeItem("yor_current_user");
// then reload the page
```

- Admin images and product additions
  - When adding via admin panel, ensure `image` string references a file that exists in the workspace and is served to pages.

SECURITY & PRODUCTION NOTES

- Current demo stores passwords in plain text — fine for demo only. In production: implement server, password hashing, authentication tokens.
- Move data to a backend (API + DB) for multi-admin sync, persistence, and security.

UX & ACCESSIBILITY SUGGESTIONS

- Add proper `<label>` elements for form inputs (currently placeholders only).
- Add ARIA labels for buttons and modals.
- Provide keyboard focus styles and ensure modals are focus-trapped.
- Consider adding a small trash icon to `Remove` to increase discoverability.

EXAMPLE FLOWS (step-by-step)

- Guest purchase flow
  1. Go to `index.html`.
  2. Click `Explore Collection` → `shop.html`.
  3. Use tabs / filters to find `Rose Velvet`.
  4. Click product card → modal opens.
  5. Qty 1 → `Add to Cart`. Toast appears.
  6. Click cart icon → `cart.html`. Adjust qty or `Remove` as needed.
  7. Click `Place Order / Inquiry` → demo order saved to `yor_orders` and toast confirms.

- Admin add product
  1. Open `admin.html` and log in as admin (admin/admin123).
  2. Click `+ Add Product`.
  3. Fill form fields and set `image` = `assets/images/my-bottle.jpg`.
  4. Save → product appears in table and dashboard updates.

DEVELOPER NOTES & NEXT STEPS

- Move images to `assets/images/` and update `DEFAULT_PRODUCTS` to those paths.
- Replace demo localStorage seeding with API calls when backend is available.
- Add proper form validation and server-side checks for production.
- Optional: add unit tests for `js/main.js` functions (renderProducts, addToCart), and E2E tests for core flows.

APPENDIX — FILES TO EDIT

- `js/data.js` — products/users/orders seeds and `initData()` logic
- `js/main.js` — rendering functions, cart behavior
- `js/admin.js` — admin UI handlers, chart, table rendering
- `css/style.css` — theme, layout, responsive styles
- `admin.html`, `index.html`, `shop.html`, `cart.html`, `login.html`, `register.html`

CONTACT & HELP

- If you want, I can generate a printable `README.pdf`, add an in-app Help modal, or convert the flow examples into step checklists inside `admin.html` for onboarding.

---

Document delivered. If you want the file exported to another format (PDF, DOCX), or want a condensed one-page quick-start for staff, tell me which and I’ll generate it now.
