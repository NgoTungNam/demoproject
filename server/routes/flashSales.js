/**
 * Flash Sale Router for EuroAsia Kitchen
 * Handles public flash sale listings, active countdowns, and Admin management.
 */

const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

/**
 * Helper to determine status of a flash sale program
 */
function getProgramStatus(sale) {
  const now = new Date();
  const start = new Date(sale.start_time);
  const end = new Date(sale.end_time);

  if (!sale.is_active) return 'inactive';
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
}

/**
 * GET /api/flash-sales/active
 * Returns the currently active flash sale program and its items with product info
 */
router.get('/flash-sales/active', async (req, res) => {
  const pool = db.promise();
  try {
    // 1. Tìm chương trình Flash Sale đang diễn ra
    const [sales] = await pool.query(`
      SELECT id, title, description, start_time, end_time, is_active
      FROM flash_sales
      WHERE is_active = 1 AND NOW() BETWEEN start_time AND end_time
      ORDER BY end_time ASC
      LIMIT 1
    `);

    if (sales.length === 0) {
      return res.json({ active: false, program: null, items: [] });
    }

    const sale = sales[0];

    // 2. Lấy danh sách sản phẩm trong Flash Sale
    const [items] = await pool.query(`
      SELECT 
        fsi.id AS flash_item_id,
        fsi.flash_sale_id,
        fsi.product_id,
        fsi.flash_price,
        fsi.quantity,
        fsi.sold_quantity,
        (fsi.quantity - fsi.sold_quantity) AS remaining_quantity,
        p.name AS product_name,
        p.price AS regular_price,
        COALESCE(p.original_price, p.price) AS original_price,
        p.image_url,
        p.stock,
        p.rating_average,
        p.review_count,
        ROUND(((COALESCE(p.original_price, p.price) - fsi.flash_price) / COALESCE(p.original_price, p.price)) * 100) AS discount_percent
      FROM flash_sale_items fsi
      JOIN products p ON fsi.product_id = p.id
      WHERE fsi.flash_sale_id = ? AND p.is_active = 1
        AND fsi.sold_quantity < fsi.quantity AND fsi.flash_price < p.price
      ORDER BY fsi.sold_quantity DESC
    `, [sale.id]);

    return res.json({
      active: true,
      program: {
        id: sale.id,
        title: sale.title,
        description: sale.description,
        start_time: sale.start_time,
        end_time: sale.end_time,
        now: new Date().toISOString(),
      },
      items,
    });
  } catch (error) {
    console.error('Lỗi khi lấy Flash Sale active:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/flash-sales
 * Admin: Lấy danh sách tất cả các chương trình Flash Sale
 */
router.get('/admin/flash-sales', requireAdmin, async (req, res) => {
  const pool = db.promise();
  try {
    const [sales] = await pool.query(`
      SELECT fs.*, 
             COUNT(fsi.id) AS total_items,
             COALESCE(SUM(fsi.quantity), 0) AS total_promo_quantity,
             COALESCE(SUM(fsi.sold_quantity), 0) AS total_sold_quantity
      FROM flash_sales fs
      LEFT JOIN flash_sale_items fsi ON fs.id = fsi.flash_sale_id
      GROUP BY fs.id
      ORDER BY fs.created_at DESC
    `);

    const enriched = sales.map(s => ({
      ...s,
      status: getProgramStatus(s),
    }));

    return res.json(enriched);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Flash Sales cho Admin:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/flash-sales/:id
 * Admin: Lấy chi tiết 1 chương trình Flash Sale cùng các sản phẩm
 */
router.get('/admin/flash-sales/:id', requireAdmin, async (req, res) => {
  const pool = db.promise();
  try {
    const [sales] = await pool.query('SELECT * FROM flash_sales WHERE id = ?', [req.params.id]);
    if (sales.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chương trình Flash Sale' });
    }

    const sale = sales[0];
    const [items] = await pool.query(`
      SELECT fsi.*, p.name AS product_name, p.price AS regular_price, p.original_price, p.stock, p.image_url
      FROM flash_sale_items fsi
      JOIN products p ON fsi.product_id = p.id
      WHERE fsi.flash_sale_id = ?
    `, [sale.id]);

    return res.json({
      ...sale,
      status: getProgramStatus(sale),
      items,
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết Flash Sale:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/flash-sales
 * Admin: Tạo chương trình Flash Sale mới
 */
router.post('/admin/flash-sales', requireAdmin, (req, res, next) => {
  req.body.name = req.body.name || req.body.title;
  req.url = '/flash-sales';
  next();
});
router.post('/admin/flash-sales', requireAdmin, async (req, res) => {
  const pool = db.promise();
  const { title, description, start_time, end_time, is_active, items } = req.body;

  if (!title || !start_time || !end_time) {
    return res.status(400).json({ error: 'Vui lòng cung cấp tiêu đề, thời gian bắt đầu và kết thúc.' });
  }

  const start = new Date(start_time);
  const end = new Date(end_time);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Thời gian không hợp lệ.' });
  }
  if (start >= end) {
    return res.status(400).json({ error: 'Thời gian kết thúc phải sau thời gian bắt đầu.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO flash_sales (title, description, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?)',
      [title, description || null, start, end, is_active !== false]
    );

    const saleId = result.insertId;

    if (Array.isArray(items) && items.length > 0) {
      const values = [];
      for (const item of items) {
        if (item.product_id && item.flash_price && item.quantity > 0) {
          values.push([saleId, item.product_id, item.flash_price, item.quantity, 0]);
        }
      }
      if (values.length > 0) {
        await pool.query(
          'INSERT INTO flash_sale_items (flash_sale_id, product_id, flash_price, quantity, sold_quantity) VALUES ?',
          [values]
        );
      }
    }

    return res.status(201).json({ success: true, id: saleId, message: 'Tạo chương trình Flash Sale thành công' });
  } catch (error) {
    console.error('Lỗi tạo Flash Sale:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/flash-sales/:id
 * Admin: Cập nhật chương trình Flash Sale
 */
router.put('/admin/flash-sales/:id', requireAdmin, (req, res, next) => {
  req.body.name = req.body.name || req.body.title;
  req.url = `/flash-sales/${encodeURIComponent(req.params.id)}`;
  next();
});
router.put('/admin/flash-sales/:id', requireAdmin, async (req, res) => {
  const pool = db.promise();
  const saleId = req.params.id;
  const { title, description, start_time, end_time, is_active, items } = req.body;

  try {
    await pool.query(
      'UPDATE flash_sales SET title = ?, description = ?, start_time = ?, end_time = ?, is_active = ? WHERE id = ?',
      [title, description || null, new Date(start_time), new Date(end_time), is_active ? 1 : 0, saleId]
    );

    // Cập nhật lại danh sách items nếu được truyền lên
    if (Array.isArray(items)) {
      await pool.query('DELETE FROM flash_sale_items WHERE flash_sale_id = ?', [saleId]);
      const values = [];
      for (const item of items) {
        if (item.product_id && item.flash_price && item.quantity > 0) {
          values.push([
            saleId,
            item.product_id,
            item.flash_price,
            item.quantity,
            item.sold_quantity || 0,
          ]);
        }
      }
      if (values.length > 0) {
        await pool.query(
          'INSERT INTO flash_sale_items (flash_sale_id, product_id, flash_price, quantity, sold_quantity) VALUES ?',
          [values]
        );
      }
    }

    return res.json({ success: true, message: 'Đã cập nhật chương trình Flash Sale' });
  } catch (error) {
    console.error('Lỗi cập nhật Flash Sale:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/flash-sales/:id
 * Admin: Xóa chương trình Flash Sale
 */
router.delete('/admin/flash-sales/:id', requireAdmin, (req, res, next) => {
  req.url = `/flash-sales/${encodeURIComponent(req.params.id)}`;
  next();
});
router.delete('/admin/flash-sales/:id', requireAdmin, async (req, res) => {
  const pool = db.promise();
  try {
    await pool.query('DELETE FROM flash_sales WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Đã xóa chương trình Flash Sale' });
  } catch (error) {
    console.error('Lỗi xóa Flash Sale:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Alias routes for frontend (uses /api/flash-sales/* instead of /api/admin/flash-sales/*)
router.get('/flash-sales/admin/all', requireAdmin, async (req, res) => {
  const pool = db.promise();
  try {
    const [sales] = await pool.query(`
      SELECT fs.*, fs.title AS name, COUNT(fsi.id) AS item_count
      FROM flash_sales fs
      LEFT JOIN flash_sale_items fsi ON fs.id = fsi.flash_sale_id
      GROUP BY fs.id ORDER BY fs.created_at DESC
    `);
    const [enriched] = [sales.map(s => ({
      ...s,
      items: [],
      status: getProgramStatus(s)
    }))];
    // Fetch items for each sale
    for (const sale of enriched) {
      const [items] = await pool.query(
        'SELECT * FROM flash_sale_items WHERE flash_sale_id = ?', [sale.id]
      );
      sale.items = items;
    }
    return res.json(enriched);
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

router.post('/flash-sales', requireAdmin, async (req, res) => {
  const pool = db.promise();
  const { name, description, start_time, end_time, is_active, items } = req.body;
  const start = new Date(start_time), end = new Date(end_time);
  if (typeof name !== 'string' || !name.trim() || name.length > 255 ||
      !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end ||
      !Array.isArray(items) || !items.length)
    return res.status(400).json({ error: 'Tên, thời gian hợp lệ và ít nhất một sản phẩm là bắt buộc.' });
  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const seen = new Set(), values = [];
      for (const item of items) {
        if (!item || typeof item !== 'object' || Array.isArray(item))
          throw Object.assign(new Error('Danh sách sản phẩm Flash Sale không hợp lệ.'), { status: 400 });
        const productId = Number(item.product_id), price = Number(item.flash_price), quantity = Number(item.quantity);
        if (!Number.isInteger(productId) || productId < 1 || !Number.isSafeInteger(price) || price <= 0 ||
            !Number.isInteger(quantity) || quantity < 1 || seen.has(productId))
          throw Object.assign(new Error('Sản phẩm, giá Flash Sale hoặc số lượng không hợp lệ (không chọn trùng sản phẩm).'), { status: 400 });
        const [product] = await connection.query('SELECT price, original_price FROM products WHERE id = ? AND is_active = 1 FOR UPDATE', [productId]);
        if (!product.length || price >= Number(product[0].price))
          throw Object.assign(new Error('Giá Flash Sale phải thấp hơn giá bán hiện hành của sản phẩm.'), { status: 400 });
        seen.add(productId); values.push([productId, price, quantity]);
      }
      const [result] = await connection.query(
        'INSERT INTO flash_sales (title, description, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), typeof description === 'string' && description.trim() ? description.trim().slice(0, 2000) : null, start, end, is_active !== false ? 1 : 0]);
      const saleId = result.insertId;
      await connection.query('INSERT INTO flash_sale_items (flash_sale_id, product_id, flash_price, quantity, sold_quantity) VALUES ?',
        [values.map(([id, price, quantity]) => [saleId, id, price, quantity, 0])]);
      await connection.commit();
      return res.status(201).json({ success: true, id: saleId });
    } catch (e) { await connection.rollback(); throw e; }
    finally { connection.release(); }
  } catch (e) { return res.status(e.status || 500).json({ error: e.message }); }
});

router.put('/flash-sales/:id', requireAdmin, async (req, res) => {
  const pool = db.promise();
  const { name, description, start_time, end_time, is_active, items } = req.body;
  const start = new Date(start_time), end = new Date(end_time);
  if (typeof name !== 'string' || !name.trim() || name.length > 255 ||
      !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end)
    return res.status(400).json({ error: 'Tên và thời gian chương trình không hợp lệ.' });
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [existing] = await connection.query('SELECT id FROM flash_sales WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!existing.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Không tìm thấy chương trình.' });
    }
    let sold = new Map();
    if (Array.isArray(items)) {
      const [current] = await connection.query('SELECT product_id, sold_quantity FROM flash_sale_items WHERE flash_sale_id=? FOR UPDATE', [req.params.id]);
      sold = new Map(current.map(row => [Number(row.product_id), Number(row.sold_quantity)]));
      const seen = new Set();
      const values = [];
      for (const item of items) {
        if (!item || typeof item !== 'object' || Array.isArray(item))
          throw Object.assign(new Error('Danh sách sản phẩm Flash Sale không hợp lệ.'), { status: 400 });
        const productId = Number(item.product_id), price = Number(item.flash_price), quantity = Number(item.quantity);
        if (!Number.isInteger(productId) || productId < 1 || !Number.isSafeInteger(price) || price <= 0 ||
            !Number.isInteger(quantity) || quantity < 1 || seen.has(productId) || quantity < (sold.get(productId) || 0))
          throw Object.assign(new Error('Sản phẩm, giá hoặc số lượng Flash Sale không hợp lệ.'), { status: 400 });
        const [product] = await connection.query('SELECT price FROM products WHERE id = ? AND is_active = 1 FOR UPDATE', [productId]);
        if (!product.length || price >= Number(product[0].price))
          throw Object.assign(new Error('Giá Flash Sale phải thấp hơn giá bán hiện hành.'), { status: 400 });
        seen.add(productId);
        values.push([req.params.id, productId, price, quantity, sold.get(productId) || 0]);
      }
      if ([...sold.entries()].some(([id, count]) => count > 0 && !seen.has(id)))
        throw Object.assign(new Error('Không thể xóa sản phẩm đã có lượt bán khỏi chương trình.'), { status: 400 });
      await connection.query('DELETE FROM flash_sale_items WHERE flash_sale_id=?', [req.params.id]);
      if (values.length) await connection.query('INSERT INTO flash_sale_items (flash_sale_id, product_id, flash_price, quantity, sold_quantity) VALUES ?', [values]);
    }
    await connection.query(
      'UPDATE flash_sales SET title=?, description=?, start_time=?, end_time=?, is_active=? WHERE id=?',
      [name.trim(), typeof description === 'string' && description.trim() ? description.trim().slice(0, 2000) : null, start, end, is_active ? 1 : 0, req.params.id]
    );
    await connection.commit();
    return res.json({ success: true });
  } catch (e) {
    if (connection) await connection.rollback();
    return res.status(e.status || 500).json({ error: e.status ? e.message : 'Không thể cập nhật Flash Sale.' });
  } finally { connection?.release(); }
});

router.delete('/flash-sales/:id', requireAdmin, async (req, res) => {
  const pool = db.promise();
  try {
    await pool.query('DELETE FROM flash_sales WHERE id=?', [req.params.id]);
    return res.json({ success: true });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

router.patch('/flash-sales/:id/toggle', requireAdmin, async (req, res) => {
  const pool = db.promise();
  try {
    await pool.query('UPDATE flash_sales SET is_active = NOT is_active WHERE id=?', [req.params.id]);
    return res.json({ success: true });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

module.exports = router;
