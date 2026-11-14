require('dotenv').config();
const db = require('./db');

async function migrate() {
  const pool = db.promise();
  try {
    const [products] = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'");
    const productColumns = new Set(products.map(row => row.COLUMN_NAME));
    if (!productColumns.has('original_price')) await pool.query('ALTER TABLE products ADD COLUMN original_price DECIMAL(12,2) NULL AFTER price');
    if (!productColumns.has('rating_average')) await pool.query('ALTER TABLE products ADD COLUMN rating_average DECIMAL(3,2) NOT NULL DEFAULT 0.00 AFTER stock');
    if (!productColumns.has('review_count')) await pool.query('ALTER TABLE products ADD COLUMN review_count INT NOT NULL DEFAULT 0 AFTER rating_average');

    const [orderItemColumns] = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items'");
    if (!orderItemColumns.some(row => row.COLUMN_NAME === 'flash_sale_item_id')) {
      await pool.query('ALTER TABLE order_items ADD COLUMN flash_sale_item_id INT NULL AFTER product_id');
      await pool.query('ALTER TABLE order_items ADD INDEX idx_order_item_flash_sale (flash_sale_item_id)');
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS reviews (
      id INT PRIMARY KEY AUTO_INCREMENT, product_id INT NOT NULL, user_id INT NULL,
      user_name VARCHAR(100) NOT NULL, user_email VARCHAR(255) NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), comment TEXT NOT NULL,
      image_url VARCHAR(500) NULL, is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
      status ENUM('approved','hidden') NOT NULL DEFAULT 'approved',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_product_status (product_id, status)
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS flash_sales (
      id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, description TEXT NULL,
      start_time DATETIME NOT NULL, end_time DATETIME NOT NULL, is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_active_time (is_active, start_time, end_time)
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS flash_sale_items (
      id INT PRIMARY KEY AUTO_INCREMENT, flash_sale_id INT NOT NULL, product_id INT NOT NULL,
      flash_price DECIMAL(12,2) NOT NULL, quantity INT NOT NULL DEFAULT 10, sold_quantity INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY unique_flash_product (flash_sale_id, product_id)
    )`);

    const [indexes] = await pool.query(
      "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reviews'");
    if (!indexes.some(row => row.INDEX_NAME === 'unique_user_product_review')) {
      const [duplicates] = await pool.query(`SELECT product_id, user_id, COUNT(*) AS copies FROM reviews
        WHERE user_id IS NOT NULL GROUP BY product_id, user_id HAVING COUNT(*) > 1 LIMIT 1`);
      if (duplicates.length) throw new Error('Duplicate account reviews exist. Resolve them before adding the one-review-per-user index.');
      await pool.query('ALTER TABLE reviews ADD UNIQUE KEY unique_user_product_review (product_id, user_id)');
    }

    console.log('E-commerce schema migration completed. Existing product prices and review/sale data were preserved.');
  } catch (error) {
    console.error('E-commerce migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
