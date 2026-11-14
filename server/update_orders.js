const db = require('./db');

async function updateOrders() {
  const pool = db.promise();
  try {
    // 1. Gán đơn hàng 68 và 69 cho user 9 (Administrator)
    await pool.query(`
      UPDATE orders 
      SET user_id = 9, status = 'delivered', payment_status = 'paid',
          shipping_name = 'Administrator', shipping_address = 'Số 8 Thượng Cát, Bắc Từ Liêm, Hà Nội',
          shipping_phone = '0965214607'
      WHERE id = 68
    `);
    await pool.query(`
      UPDATE orders 
      SET user_id = 9, status = 'processing', payment_status = 'paid',
          shipping_name = 'Administrator', shipping_address = 'Số 8 Thượng Cát, Bắc Từ Liêm, Hà Nội',
          shipping_phone = '0965214607'
      WHERE id = 69
    `);

    // 2. Tạo thêm 1 đơn hàng mới mua Chảo Chống Dính Flash Sale cho Administrator
    const [resFlash] = await pool.query(`
      INSERT INTO orders (user_id, total_amount, shipping_name, shipping_address, shipping_phone, payment_method, payment_status, status)
      VALUES (9, 228000, 'Administrator', 'Số 8 Thượng Cát, Bắc Từ Liêm, Hà Nội', '0965214607', 'cod', 'pending_cod', 'delivered')
    `);
    await pool.query(`
      INSERT INTO order_items (order_id, product_id, flash_sale_item_id, product_name, quantity, price, total_price)
      VALUES (?, 7, 1, 'Chảo Chống Dính (Flash Sale -40%)', 1, 228000, 228000)
    `, [resFlash.insertId]);

    // 3. Cập nhật trạng thái đơn hàng cho user 2 (Ngô Tùng Nam)
    await pool.query(`
      UPDATE orders 
      SET status = 'delivered', payment_status = 'paid',
          shipping_name = 'Ngô Tùng Nam', shipping_address = '123 Cầu Giấy, Hà Nội', shipping_phone = '0912345678'
      WHERE id = 60
    `);
    await pool.query(`
      UPDATE orders 
      SET status = 'shipped', payment_status = 'paid',
          shipping_name = 'Ngô Tùng Nam', shipping_address = '123 Cầu Giấy, Hà Nội', shipping_phone = '0912345678'
      WHERE id = 61
    `);
    await pool.query(`
      UPDATE orders 
      SET status = 'processing', payment_status = 'pending_cod',
          shipping_name = 'Ngô Tùng Nam', shipping_address = '123 Cầu Giấy, Hà Nội', shipping_phone = '0912345678'
      WHERE id = 62
    `);

    // Gán 1 đơn hàng cho user 1 (Quản Trị Viên admin@euroasia.com)
    await pool.query(`
      UPDATE orders SET user_id = 1 WHERE id = 55
    `);

    console.log('✅ Đã cập nhật dữ liệu đơn hàng thực tế thành công!');
  } catch (err) {
    console.error('Lỗi cập nhật:', err);
  } finally {
    process.exit(0);
  }
}

updateOrders();
