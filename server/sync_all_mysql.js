require('dotenv').config();
const db = require('./db');

async function syncAll() {
  try {
    console.log('🔄 Bắt đầu đồng bộ chuẩn xác toàn bộ dữ liệu vào MySQL euroasia_db...');

    // 1. Đồng bộ Khách hàng (users: full_name, email, phone, role)
    await db.promise().query(`
      INSERT INTO users (id, full_name, email, phone, role, password_hash)
      VALUES 
        (1, 'Ngô Tùng Nam', 'admin@gmail.com', '0965214607', 'admin', '$2b$10$abcdefghijklmnopqrstuvwxyz123456'),
        (2, 'Trần Minh Quân', 'quan.tran@gmail.com', '0912345678', 'customer', '$2b$10$abcdefghijklmnopqrstuvwxyz123456'),
        (3, 'Lê Hoàng Yến', 'hoangyen@gmail.com', '0987654321', 'customer', '$2b$10$abcdefghijklmnopqrstuvwxyz123456'),
        (4, 'Phạm Hải Đăng', 'haidang.chef@gmail.com', '0903112233', 'customer', '$2b$10$abcdefghijklmnopqrstuvwxyz123456')
      ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), email=VALUES(email), phone=VALUES(phone), role=VALUES(role)
    `);
    console.log('✅ 1. Bảng users (Khách hàng) đã đồng bộ 4 người dùng');

    // 2. Đồng bộ Đơn hàng (orders: shipping_name, shipping_phone, shipping_address, total_amount, payment_method, payment_status, status)
    await db.promise().query(`
      INSERT INTO orders (id, user_id, shipping_name, shipping_phone, shipping_address, total_amount, payment_method, payment_status, status, created_at)
      VALUES
        (101, 1, 'Ngô Tùng Nam', '0965214607', 'Hà Nội', 450000.00, 'momo', 'paid', 'delivered', '2026-11-24 21:34:00'),
        (102, 1, 'Ngô Tùng Nam', '0965214607', 'Hà Nội', 450000.00, 'momo', 'paid', 'processing', '2026-11-24 19:20:00'),
        (103, 1, 'Ngô Tùng Nam', '0965214607', 'Hà Nội', 1200000.00, 'momo', 'paid', 'pending', '2026-11-24 19:14:00'),
        (104, 1, 'Ngô Tùng Nam', '0965214607', 'Hà Nội', 12000000.00, 'momo', 'paid', 'pending', '2026-11-24 18:50:00'),
        (105, 1, 'Ngô Tùng Nam', '0965214607', 'Hà Nội', 1040000.00, 'cod', 'pending_cod', 'pending', '2026-11-24 17:08:00'),
        (106, 2, 'Trần Văn Hùng', '0912345678', 'Hồ Chí Minh', 830000.00, 'vnpay', 'paid', 'processing', '2026-11-24 16:00:00')
      ON DUPLICATE KEY UPDATE 
        total_amount=VALUES(total_amount), 
        payment_method=VALUES(payment_method), 
        payment_status=VALUES(payment_status), 
        status=VALUES(status)
    `);
    console.log('✅ 2. Bảng orders (Đơn hàng) đã đồng bộ dữ liệu thực tế');

    // 3. Đồng bộ Đánh giá (reviews: product_id, user_name, rating, comment, status)
    await db.promise().query(`
      INSERT INTO reviews (id, product_id, user_name, rating, comment, status, created_at)
      VALUES
        (1, 1, 'Ngô Tùng Nam', 5, 'Dao rất bén, cầm đầm tay và đường cắt sắc ngọt. Thái thịt bò hay gọt rau củ đều rất mượt!', 'approved', '2026-11-22 10:00:00'),
        (2, 2, 'Trần Minh Quân', 5, 'Nồi 3 đáy dày dặn, bắt từ cực tốt, nấu trên bếp từ sôi rất nhanh và đều. Đóng gói cẩn thận.', 'approved', '2026-11-20 14:00:00'),
        (3, 7, 'Lê Hoàng Yến', 5, 'Chảo chống dính đá hoa cương này chiên trứng không cần nhiều dầu, không bị dính đáy chút nào. 5 sao!', 'approved', '2026-11-18 11:30:00'),
        (4, 8, 'Phạm Hải Đăng', 5, 'Thìa sáng bóng, inox 304 cầm rất chắc tay và an toàn. Rất đáng tiền!', 'approved', '2026-11-23 09:15:00')
      ON DUPLICATE KEY UPDATE 
        rating=VALUES(rating), 
        comment=VALUES(comment), 
        status=VALUES(status)
    `);
    console.log('✅ 3. Bảng reviews (Đánh giá) đã đồng bộ');

    // 4. Đồng bộ Flash Sales (flash_sales: title, name, start_time, end_time, is_active)
    await db.promise().query(`
      INSERT INTO flash_sales (id, title, name, start_time, end_time, is_active)
      VALUES 
        (1, 'Giờ Vàng Bếp Xinh - Ưu Đãi 25%', 'Giờ Vàng Bếp Xinh - Ưu Đãi 25%', NOW() - INTERVAL 2 HOUR, NOW() + INTERVAL 3 DAY, 1),
        (2, 'Flash Sale Gia Dụng Châu Âu', 'Flash Sale Gia Dụng Châu Âu', NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 1 DAY, 1)
      ON DUPLICATE KEY UPDATE title=VALUES(title), name=VALUES(name), end_time=VALUES(end_time), is_active=VALUES(is_active)
    `);

    await db.promise().query(`
      INSERT INTO flash_sale_items (id, flash_sale_id, product_id, flash_price, quantity)
      VALUES 
        (1, 1, 1, 256000.00, 20),
        (2, 1, 7, 299000.00, 15),
        (3, 2, 9, 2400000.00, 10),
        (4, 2, 10, 1490000.00, 15)
      ON DUPLICATE KEY UPDATE flash_price=VALUES(flash_price), quantity=VALUES(quantity)
    `);
    console.log('✅ 4. Bảng flash_sales & flash_sale_items đã đồng bộ');

    // In thống kê các bảng
    console.log('\n📊 TẤT CẢ CÁC BẢNG TRONG MYSQL ĐÃ ĐƯỢC ĐỒNG BỘ:');
    const tableList = ['categories', 'products', 'users', 'orders', 'reviews', 'flash_sales', 'flash_sale_items'];
    for (const tbl of tableList) {
      const [c] = await db.promise().query("SELECT COUNT(*) as cnt FROM " + tbl);
      console.log(`- Bảng ${tbl.padEnd(18)}: ${c[0].cnt} bản ghi`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi đồng bộ toàn bộ DB:', err);
    process.exit(1);
  }
}

syncAll();
