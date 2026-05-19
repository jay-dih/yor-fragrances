-- YOR Fragrances Database Schema

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `role` ENUM('admin', 'user') DEFAULT 'user',
  `registered_at` DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `category` ENUM('women', 'men', 'unisex') NOT NULL,
  `notes` VARCHAR(50),
  `price` DECIMAL(10, 2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `featured` BOOLEAN DEFAULT FALSE,
  `description` TEXT,
  `image` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(20) PRIMARY KEY,
  `customer_name` VARCHAR(100) NOT NULL,
  `items_summary` TEXT NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('Pending', 'Confirmed', 'Shipped', 'Completed', 'Cancelled') DEFAULT 'Pending',
  `order_date` DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `contact` VARCHAR(100) NOT NULL,
  `message` TEXT NOT NULL,
  `inquiry_date` DATE NOT NULL
);

-- Seed Data for Users
-- Password is 'admin123' (hashed using md5 for simplicity in this demo, but password_hash() should be used in production)
-- For demonstration, I will insert plain text for now, but auth.php will use password_verify. 
-- Wait, let's just insert raw and have auth.php check against it or hash it. Let's use simple MD5 or plain for local test, but PHP's password_hash is better.
-- Let's just insert a default admin.
INSERT IGNORE INTO `users` (`username`, `password`, `name`, `email`, `role`, `registered_at`) VALUES
('admin', '$2y$10$wE9q3p2r6d.2S5c/m4LwD.O4aH.6O1oP8M.n7G/qR2R/w0.1d6D3S', 'YOR Admin', 'admin@yorfragrances.com', 'admin', '2025-01-01'), -- password: admin123
('user', '$2y$10$1Y.VpG3E3K.s6F.B2O7D/e.6W/Y/kH.S2w.A5sZ.6L9Z/Y7A7L/W2', 'Sample User', 'user@example.com', 'user', '2025-03-10'); -- password: user123

-- Seed Data for Products
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `notes`, `price`, `stock`, `featured`, `description`, `image`) VALUES
(1, 'Rose Velvet', 'women', 'floral', 850, 20, 1, 'A rich, velvety blend of Turkish rose, soft musk, and warm sandalwood. Perfect for evenings and special occasions.', 'assets/images/floral.png'),
(2, 'Amber Dusk', 'women', 'oriental', 720, 15, 0, 'Sweet amber heart notes with vanilla base and hints of jasmine. A warm and comforting scent for daily wear.', 'assets/images/floral.png'),
(3, 'Ocean Noir', 'men', 'fresh', 950, 12, 1, 'Bold and fresh – crisp aquatic top notes with dark cedar and vetiver base. A confident, modern masculine scent.', 'assets/images/woody.png'),
(4, 'Cedar & Smoke', 'men', 'woody', 1100, 8, 0, 'A brooding blend of smoked cedar, leather accord, and a hint of black pepper. For the bold and distinguished.', 'assets/images/woody.png'),
(5, 'Citrus Bloom', 'unisex', 'citrus', 650, 25, 0, 'Light and uplifting. Fresh bergamot and lemon zest over a floral heart of white peony. Great for daytime.', 'assets/images/unisex.png'),
(6, 'Midnight Oud', 'unisex', 'woody', 1400, 6, 1, 'A bold oud-based perfume with earthy richness and exotic depth. Long-lasting and deeply impactful.', 'assets/images/woody.png'),
(7, 'Peach Whisper', 'women', 'fruity', 580, 18, 0, 'Sweet, delicate peach blossoms and fresh apricot with a light musky dry down. Youthful and playful.', 'assets/images/floral.png'),
(8, 'Green Forest', 'men', 'fresh', 780, 14, 0, 'Earthy ferns, pine needles, and green moss. A fresh and grounding fragrance inspired by nature.', 'assets/images/unisex.png'),
(9, 'Vanilla Soleil', 'unisex', 'vanilla', 690, 22, 1, 'A warm, sun-kissed vanilla with coconut milk and soft florals. Cheerful, cozy, and universally loved.', 'assets/images/unisex.png'),
(10, 'Iris Garden', 'women', 'floral', 880, 10, 0, 'Powdery iris with violet leaf and pale wood. Sophisticated, clean, and effortlessly elegant.', 'assets/images/floral.png'),
(11, 'Spiced Tobacco', 'men', 'spicy', 1250, 7, 0, 'Warm tobacco leaf, spiced with cardamom and cinnamon. Rich and addictive – a statement fragrance.', 'assets/images/woody.png'),
(12, 'White Musk', 'unisex', 'musk', 550, 30, 0, 'Clean, soft white musk over a sheer floral base. The ultimate everyday scent – subtle and addicting.', 'assets/images/unisex.png');

-- Seed Data for Orders
INSERT IGNORE INTO `orders` (`id`, `customer_name`, `items_summary`, `total`, `status`, `order_date`) VALUES
('ORD-001', 'Sample User', 'Rose Velvet x1, White Musk x2', 1950, 'Pending', '2025-06-01'),
('ORD-002', 'Guest', 'Ocean Noir x1', 950, 'Confirmed', '2025-06-03'),
('ORD-003', 'Sample User', 'Midnight Oud x1', 1400, 'Confirmed', '2025-06-04');
