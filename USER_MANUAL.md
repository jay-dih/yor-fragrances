YOR Fragrances — User Manual (Non-technical)

Purpose

- Quick, clear guide for people who will use the website (customers, staff, and the admin).
- Written in plain language. Short steps showing what happens when you click buttons or use features.

How to read this manual

- If you are a customer/shopper, start at "For Customers".
- If you are the store admin (managing products/orders), read "For Admin".
- Each section lists pages, buttons, and what to expect after you click them.

---

FOR CUSTOMERS (GUEST OR REGISTERED)

1. Getting around

- Top bar (always visible):
  - Search box: type a product name or keyword. As you type, suggestions appear. Click a suggestion to see that product’s details.
  - Logo: click the logo to return to the Home page.
  - Cart icon: click to view your cart (lists items you’ve added). A small number shows how many items are in your cart.
  - User icon: click to open account options (log in or register).
  - Mobile menu button: on small screens, tap it to open full navigation.

2. Home page (index.html)

- Hero image and CTA: click the “Explore Collection” button to go to the Shop page.
- Featured products: scroll to see highlighted items. Click any product image or name to open its details.
- Mid-banner: promotional image only; clicking is optional if it links to a collection.
- About & Contact: short info about the business and a contact form.

3. Shop page (shop.html)

- Category tabs (All / Women / Men / Unisex): click a tab to filter products by that category.
- Filter button: shows price and sort options. Select a price range or a sort order to change what products appear.
- Product cards: each shows image, name, and price.
  - Click the card to open the product detail modal.
  - Buttons on the card:
    - Add to Cart: adds the product to your cart and updates the cart number in the top bar.
    - Inquire: opens a quick contact or inquiry option (fills the message with the product name).

4. Product detail modal

- Quantity control: choose how many you want.
- Add to Cart: places that number of items into your cart and shows a short confirmation message (toast).
- Close: click outside or the close button to return to shopping.

5. Cart page (cart.html)

- Shows all items you’ve added.
- Quantity buttons (- and +): change the quantity for an item; totals update immediately.
- Remove (pill button): removes that item from your cart; the order summary updates.
- Order Summary: shows subtotal, shipping (if set), and total.
- Place Order / Inquiry: click to submit your order or inquiry. In this demo site, the action saves a record you can check in the admin area.
- Continue Shopping: link back to the Shop or Home pages.

6. Login & Register

- Login: enter username/email and password. If correct, you’re logged in and the site remembers you until you log out.
- Register: create an account (saves locally in the demo). After registering you can log in and your cart can persist between visits.

7. Contact form

- Use the Get In Touch form on the Home page to send messages or custom requests.
- Fill Name, Phone/Email, and Message. Click Send Message to submit; you’ll see a confirmation (toast).

Common questions (for customers)

- Why can’t I see a product picture? The site looks for an image file. If it’s missing the page shows a simple placeholder. Try refreshing the page.
- My cart disappeared after closing the browser. If you used a different device or cleared browser storage, local data won’t be preserved. Register and log in to keep your cart on that device.

---

FOR ADMIN (STORE MANAGERS)

Important

- Admin access is on the `admin.html` page. Demo admin credentials in this version are `admin` / `admin123`.
- Actions here change data stored locally in the browser for this demo; in a real deployment those changes would save to a server.

1. Dashboard

- What you see: total products, total orders, registered users, categories.
- Product Category Breakdown: a small bar chart showing how many products are in each category (Women, Men, Unisex). Use it to see inventory balance.
- Top Products by Inquiries: list of product names with current stock — helps identify popular items.

2. Products tab (list)

- Table columns: Image, Name, Category, Price, Stock, Featured, Actions.
- Add Product button: click to open a form where you enter product details.
  - Image: enter the image path (recommended: `assets/images/yourphoto.jpg`). If the image is not present the product shows a placeholder.
  - Name / Category / Price / Stock / Description / Featured: fill as needed.
  - Save: the new product appears in the product list and the dashboard updates.
- Edit button (per product): click to open the same form pre-filled; change fields and save.
- Delete button: click to remove the product. Confirm when prompted.

3. Users & Orders tabs

- Users: view registered users and basic info.
- Orders: see demo orders (customer name, items, total, status, date). You can use this to track incoming demo orders.

4. What each button does (admin)

- - Add Product: opens add form. After saving, product list and dashboard counts change.
- Edit: opens edit form. After saving, updates appear immediately.
- Delete: removes product after confirmation and updates counts.

5. Notes for admin use

- Always check the image path when adding a product. If you’re not sure where images live, put them into the `assets/images` folder and reference them as `assets/images/filename.jpg`.
- After many changes you may refresh the dashboard to verify updated totals.

---

TROUBLESHOOTING (NON-TECH)

- I clicked Add to Cart but nothing happened.
  - Look at the top-right cart number. If it didn’t increase, try again or refresh the page.
- I removed an item but the total didn’t change.
  - The cart updates automatically. If the total did not change, refresh the page. If the problem continues, note the product name and tell support.
- I can’t see an image.
  - The image file might be missing. Try refreshing the page; if it persists, contact whoever manages the site and provide the product name.

CONTACT & SUPPORT

- For help with the demo site and content updates, contact the site owner or the developer who provided this files package.
- If you want a printed manual or a PDF of this page, ask and it will be exported.

---

SHORT CHECKLIST (quick tasks)

- Customer: find product → open product → add to cart → open cart → place order.
- Admin: login → + Add Product → enter details & image path → save → confirm product appears in list and dashboard.

Document version: user-focused manual — delivered.

If you want this converted to a one-page PDF or a short slide for presentation to your professor, I can create that next.
