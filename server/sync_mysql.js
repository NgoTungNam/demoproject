require('dotenv').config();
const db = require('./db');

async function syncData() {
  try {
    console.log('🔄 Đang đồng bộ dữ liệu vào MySQL euroasia_db...');

    // 1. Đồng bộ danh mục
    await db.promise().query(`
      INSERT INTO categories (id, name, description) 
      VALUES (3, 'Thiết bị nhà bếp', 'Nồi chiên không dầu, máy ép, máy xay sinh tố...')
      ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)
    `);
    console.log('✅ Đã đồng bộ Danh Mục (Thiết bị nhà bếp)');

    // 2. Đồng bộ Nồi Chiên Không Dầu
    await db.promise().query(`
      INSERT INTO products (id, category_id, name, description, price, original_price, stock, rating_average, review_count, image_url, is_active)
      VALUES (9, 3, 'Nồi Chiên Không Dầu', 'Nồi chiên không dầu cao cấp công nghệ châu âu', 3000000.00, 4000000.00, 100, 5.00, 1, '/images/products/noichien.jpg', 1)
      ON DUPLICATE KEY UPDATE 
        category_id = VALUES(category_id),
        name = VALUES(name),
        description = VALUES(description),
        price = VALUES(price),
        original_price = VALUES(original_price),
        stock = VALUES(stock),
        image_url = VALUES(image_url),
        is_active = 1
    `);
    console.log('✅ Đã đồng bộ Nồi Chiên Không Dầu vào bảng products');

    // 3. Đồng bộ Máy Ép Chậm Hoa Quả
    await db.promise().query(`
      INSERT INTO products (id, category_id, name, description, price, original_price, stock, rating_average, review_count, image_url, is_active)
      VALUES (10, 3, 'Máy Ép Chậm Hoa Quả EuroAsia', 'Máy ép chậm trái cây hoa quả giữ trọn dưỡng chất, ép kiệt bã, công nghệ trục vít xoắn ốc hiện đại', 1850000.00, 2450000.00, 50, 5.00, 8, '/images/products/mayep.webp', 1)
      ON DUPLICATE KEY UPDATE 
        category_id = VALUES(category_id),
        name = VALUES(name),
        description = VALUES(description),
        price = VALUES(price),
        original_price = VALUES(original_price),
        stock = VALUES(stock),
        image_url = VALUES(image_url),
        is_active = 1
    `);
    console.log('✅ Đã đồng bộ Máy Ép Chậm Hoa Quả vào bảng products');

    const [rows] = await db.promise().query('SELECT id, category_id, name, price, stock, image_url FROM products ORDER BY id ASC');
    console.log('\n📦 TẤT CẢ SẢN PHẨM HIỆN CÓ TRONG MYSQL:');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi đồng bộ vào MySQL:', err.message);
    process.exit(1);
  }
}

syncData();
