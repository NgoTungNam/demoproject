const db = require('./db');

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
    description TEXT, price DECIMAL(12,2) NOT NULL, stock INT DEFAULT 0,
    image_url VARCHAR(255), is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
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
    product_name VARCHAR(255), quantity INT NOT NULL, price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
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
];

async function initializeSchema() {
  const pool = db.promise();
  for (const statement of statements) await pool.query(statement);
  console.log('Database schema is ready.');
}

module.exports = { initializeSchema };
