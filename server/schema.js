const db = require("./db");

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, full_name VARCHAR(100), phone VARCHAR(20),
    address TEXT, role ENUM('admin','customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL, slug VARCHAR(100) UNIQUE,
    description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT, category_id INT NULL, name VARCHAR(255) NOT NULL,
    description TEXT, price DECIMAL(12,2) NOT NULL, original_price DECIMAL(12,2) NULL, stock INT DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00, review_count INT DEFAULT 0,
    image_url VARCHAR(255), is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT, product_id INT NOT NULL, user_id INT NULL,
    user_name VARCHAR(100) NOT NULL, user_email VARCHAR(255) NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), comment TEXT NOT NULL,
    image_url VARCHAR(500) NULL, is_verified_purchase BOOLEAN DEFAULT FALSE,
    status ENUM('approved', 'hidden') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_product_status (product_id, status),
    UNIQUE KEY unique_user_product_review (product_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS flash_sales (
    id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, description TEXT NULL,
    start_time DATETIME NOT NULL, end_time DATETIME NOT NULL, is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_time (is_active, start_time, end_time)
  )`,
  `CREATE TABLE IF NOT EXISTS flash_sale_items (
    id INT PRIMARY KEY AUTO_INCREMENT, flash_sale_id INT NOT NULL, product_id INT NOT NULL,
    flash_price DECIMAL(12,2) NOT NULL, quantity INT NOT NULL DEFAULT 10, sold_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_flash_product (flash_sale_id, product_id)
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NULL, total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    shipping_name VARCHAR(100), shipping_address TEXT, shipping_phone VARCHAR(20), note TEXT,
    payment_method ENUM('cod','momo','vnpay','bank') DEFAULT 'cod',
    payment_status ENUM('pending','pending_cod','paid','failed','refunded') DEFAULT 'pending',
    payment_ref VARCHAR(255) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT, order_id INT NOT NULL, product_id INT NULL,
    flash_sale_item_id INT NULL,
    product_name VARCHAR(255), quantity INT NOT NULL, price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_order_item_flash_sale (flash_sale_item_id)
  )`,
  `INSERT INTO categories (name, description)
   SELECT 'Dụng cụ bếp', 'Các loại dao, kéo, thớt...'
   WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Dụng cụ bếp')`,
  `INSERT INTO categories (name, description)
   SELECT 'Nồi & Chảo', 'Nồi inox, chảo chống dính...'
   WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Nồi & Chảo')`,
  `INSERT INTO products (category_id, name, price, stock, image_url)
   SELECT c.id, 'Dao Bếp Chef', 320000, 50, '/images/products/dao.jpg'
   FROM categories c WHERE c.name = 'Dụng cụ bếp'
   AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Dao Bếp Chef')`,
  `INSERT INTO products (category_id, name, price, stock, image_url)
   SELECT c.id, 'Nồi Inox Cao Cấp', 450000, 20, '/images/products/noiinox.jpg'
   FROM categories c WHERE c.name = 'Nồi & Chảo'
   AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Nồi Inox Cao Cấp')`,
  `INSERT INTO products (category_id, name, price, stock, image_url)
   SELECT c.id, 'Chảo Chống Dính', 380000, 30, '/images/products/chao.jpg'
   FROM categories c WHERE c.name = 'Nồi & Chảo'
   AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Chảo Chống Dính')`,
  `INSERT INTO products (category_id, name, price, stock, image_url)
   SELECT c.id, 'Thìa Inox', 45000, 100, '/images/products/thia.jpg'
   FROM categories c WHERE c.name = 'Dụng cụ bếp'
   AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Thìa Inox')`,
];

async function initializeSchema() {
  const pool = db.promise();
  for (const statement of statements) await pool.query(statement);
  console.log("Database schema is ready.");
}

module.exports = { initializeSchema };
