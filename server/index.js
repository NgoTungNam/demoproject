require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require('crypto');
const db = require("./db");
const payment = require("./payment");
const momoPayment = require("./payment/momo");
const vnpayPayment = require("./payment/vnpay");
const { initializeSchema } = require("./schema");
const chatRouter = require("./routes/chat");
const flashSalesRouter = require("./routes/flashSales");
const reviewsRouter = require("./routes/reviews");
const { issueToken, hashPassword, verifyPassword, requireAdmin, requireUser, optionalUser } = require("./auth");

const app = express();
const PORT = process.env.PORT || 8080;
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false });
const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
const envOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',').map(origin => origin.trim()).filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Serve ảnh sản phẩm từ thư mục public
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));
app.use(express.static(path.join(__dirname, "../dist")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "EuroAsia Backend API", time: new Date().toISOString() });
});

// --- Multer: Local disk storage ---
const uploadDir = path.join(__dirname, "../public/images/products");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = /jpg|jpeg|png|webp/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});



// ================= ROUTES ================= //

// --- AI CHATBOT ADVISOR ---
app.use("/api", chatRouter);

// --- FLASH SALES ---
app.use("/api", flashSalesRouter);

// --- REVIEWS ---
app.use("/api", reviewsRouter);

// --- CATEGORIES ---
app.get("/api/categories", (req, res) => {
  db.query("SELECT * FROM categories ORDER BY id ASC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/categories", requireAdmin, async (req, res) => {
  const { name, description } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Tên danh mục không được để trống.' });
  }
  try {
    const [result] = await db.promise().query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name.trim(), description ? description.trim() : '']
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/categories/:id", requireAdmin, async (req, res) => {
  const { name, description } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Tên danh mục không được để trống.' });
  }
  try {
    await db.promise().query(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [name.trim(), description ? description.trim() : '', req.params.id]
    );
    res.json({ success: true, message: 'Đã cập nhật danh mục' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("UPDATE products SET category_id = NULL WHERE category_id = ?", [req.params.id]);
    await connection.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    await connection.commit();
    res.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// --- PRODUCTS ---
// Enriches product data with active flash sale pricing + discount percentage
async function enrichProductsWithFlashSale(products, pool) {
  if (!products || products.length === 0) return products;
  const productIds = products.map(p => p.id);

  try {
    const placeholders = productIds.map(() => '?').join(',');
    const [flashItems] = await pool.query(`
      SELECT fsi.product_id, fsi.flash_price, fsi.quantity, fsi.sold_quantity, fs.end_time AS flash_end_time
      FROM flash_sale_items fsi
      JOIN flash_sales fs ON fsi.flash_sale_id = fs.id
      WHERE fsi.product_id IN (${placeholders})
        AND fs.is_active = 1
        AND NOW() BETWEEN fs.start_time AND fs.end_time
        AND fsi.sold_quantity < fsi.quantity
        AND fsi.flash_price < (SELECT p.price FROM products p WHERE p.id = fsi.product_id)
      ORDER BY fsi.flash_price ASC, fs.end_time ASC
    `, productIds);

    const flashMap = {};
    flashItems.forEach(item => { if (!flashMap[item.product_id]) flashMap[item.product_id] = item; });

    return products.map(p => {
      const flash = flashMap[p.id];
      const originalPrice = parseFloat(p.original_price) || parseFloat(p.price);
      const currentPrice = flash ? parseFloat(flash.flash_price) : parseFloat(p.price);
      const discountPercent = originalPrice > currentPrice
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;

      return {
        ...p,
        original_price: originalPrice,
        current_price: currentPrice,
        has_flash_sale: !!flash,
        flash_end_time: flash ? flash.flash_end_time : null,
        flash_remaining: flash ? (flash.quantity - flash.sold_quantity) : null,
        discount_percent: discountPercent,
      };
    });
  } catch (e) {
    console.error('enrichProductsWithFlashSale error:', e.message);
    return products.map(p => ({
      ...p,
      current_price: parseFloat(p.price),
      original_price: parseFloat(p.original_price) || parseFloat(p.price),
      has_flash_sale: false,
      flash_end_time: null,
      flash_remaining: null,
      discount_percent: 0,
    }));
  }
}

app.get("/api/products", async (req, res) => {
  const pool = db.promise();
  const { categoryId } = req.query;
  let sql = `SELECT p.*, c.name AS category_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id`;
  let params = [];
  if (categoryId) { sql += " WHERE p.category_id = ?"; params.push(categoryId); }
  sql += " ORDER BY p.created_at DESC";

  try {
    const [results] = await pool.query(sql, params);
    const enriched = await enrichProductsWithFlashSale(results, pool);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const pool = db.promise();
  try {
    const [results] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (results.length === 0)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    const [enriched] = await enrichProductsWithFlashSale(results, pool);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prices/quote', async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || !items.length || items.length > 50) return res.status(400).json({ error: 'Giỏ hàng không hợp lệ.' });
  const quantities = new Map();
  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return res.status(400).json({ error: 'Dữ liệu sản phẩm không hợp lệ.' });
    const id = Number(item.id), quantity = Number(item.quantity);
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99)
      return res.status(400).json({ error: 'Sản phẩm hoặc số lượng không hợp lệ.' });
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }
  if ([...quantities.values()].some(q => q > 99)) return res.status(400).json({ error: 'Số lượng sản phẩm tối đa là 99.' });
  try {
    const ids = [...quantities.keys()];
    const quantityCase = `CASE p.id ${ids.map(() => 'WHEN ? THEN ?').join(' ')} ELSE 0 END`;
    const quantityArgs = ids.flatMap(id => [id, quantities.get(id)]);
    const [products] = await db.promise().query(
      `SELECT p.id, p.name, p.price, COALESCE(p.original_price, p.price) AS original_price,
       p.stock, p.image_url, p.rating_average, p.review_count,
       (SELECT fsi.flash_price FROM flash_sale_items fsi JOIN flash_sales fs ON fs.id=fsi.flash_sale_id
        WHERE fsi.product_id=p.id AND fs.is_active=1 AND NOW() BETWEEN fs.start_time AND fs.end_time
          AND fsi.sold_quantity + (${quantityCase}) <= fsi.quantity AND fsi.flash_price < p.price
        ORDER BY fsi.flash_price ASC, fs.end_time ASC LIMIT 1) AS flash_price,
       (SELECT fsi.quantity - fsi.sold_quantity FROM flash_sale_items fsi JOIN flash_sales fs ON fs.id=fsi.flash_sale_id
        WHERE fsi.product_id=p.id AND fs.is_active=1 AND NOW() BETWEEN fs.start_time AND fs.end_time
          AND fsi.sold_quantity + (${quantityCase}) <= fsi.quantity AND fsi.flash_price < p.price
        ORDER BY fsi.flash_price ASC, fs.end_time ASC LIMIT 1) AS flash_remaining,
       (SELECT fs.end_time FROM flash_sale_items fsi JOIN flash_sales fs ON fs.id=fsi.flash_sale_id
        WHERE fsi.product_id=p.id AND fs.is_active=1 AND NOW() BETWEEN fs.start_time AND fs.end_time
          AND fsi.sold_quantity + (${quantityCase}) <= fsi.quantity AND fsi.flash_price < p.price
        ORDER BY fsi.flash_price ASC, fs.end_time ASC LIMIT 1) AS flash_end_time
       FROM products p WHERE p.id IN (${ids.map(() => '?').join(',')}) AND p.is_active=1`,
      quantityArgs.concat(quantityArgs, quantityArgs, ids));
    if (products.length !== ids.length) return res.status(409).json({ error: 'Một sản phẩm không còn khả dụng.' });
    const lines = products.map(p => {
      const current = Number(p.flash_price ?? p.price);
      const original = Number(p.original_price);
      return { id: p.id, name: p.name, quantity: quantities.get(Number(p.id)), price: current,
        current_price: current, original_price: original, has_flash_sale: p.flash_price !== null,
        flash_remaining: p.flash_remaining, flash_end_time: p.flash_end_time,
        discount_percent: original > current ? Math.round((original-current)/original*100) : 0,
        stock: Number(p.stock), image_url: p.image_url, rating_average: Number(p.rating_average || 0), review_count: Number(p.review_count || 0) };
    });
    return res.json({ items: lines, total_amount: lines.reduce((sum, line) => sum + line.price * line.quantity, 0) });
  } catch { return res.status(500).json({ error: 'Không thể cập nhật giá giỏ hàng.' }); }
});

// Product update
app.put("/api/products/:id", requireAdmin, upload.single("image"), (req, res) => {
  const { name, price, original_price, description, category_id, stock, is_active } = req.body;
  const salePrice = Number(price);
  const listPrice = original_price === '' || original_price == null ? null : Number(original_price);
  const stockCount = stock !== undefined && stock !== '' ? Number(stock) : 0;
  const categoryId = category_id !== undefined && category_id !== '' && Number(category_id) > 0 ? Number(category_id) : null;

  if (typeof name !== 'string' || !name.trim() || name.trim().length > 255 || isNaN(salePrice) || salePrice <= 0) {
    return res.status(400).json({ error: 'Tên và giá sản phẩm không hợp lệ.' });
  }

  const image_url = req.file ? `/images/products/${req.file.filename}` : undefined;

  let sql = `UPDATE products SET name=?, price=?, original_price=?, description=?, category_id=?, stock=?, is_active=?`;
  const params = [name.trim(), salePrice, listPrice, description || '', categoryId, stockCount, is_active !== '0' ? 1 : 0];

  if (image_url) { sql += `, image_url=?`; params.push(image_url); }
  sql += ` WHERE id=?`;
  params.push(req.params.id);

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Đã cập nhật sản phẩm' });
  });
});

// Product delete (Safe with foreign keys)
app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  const productId = req.params.id;
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const [exists] = await connection.query("SELECT id FROM products WHERE id = ?", [productId]);
    if (!exists.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    // 1. Delete cart items
    await connection.query("DELETE FROM cart_items WHERE product_id = ?", [productId]);

    // 2. Delete flash sale items
    await connection.query("DELETE FROM flash_sale_items WHERE product_id = ?", [productId]);

    // 3. Delete reviews
    await connection.query("DELETE FROM reviews WHERE product_id = ?", [productId]);

    // 4. Decouple order_items (preserve order records while decoupling product)
    await connection.query("UPDATE order_items SET product_id = NULL WHERE product_id = ?", [productId]);

    // 5. Delete product
    await connection.query("DELETE FROM products WHERE id = ?", [productId]);

    await connection.commit();
    return res.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
  } catch (err) {
    await connection.rollback();
    console.error('[Delete product error]', err);
    return res.status(500).json({ error: 'Lỗi khi xóa sản phẩm: ' + err.message });
  } finally {
    connection.release();
  }
});

app.post("/api/products", requireAdmin, upload.single("image"), (req, res) => {
  const { name, price, original_price, description, category_id, stock } = req.body;
  const salePrice = Number(price), listPrice = original_price === '' || original_price == null ? null : Number(original_price);
  const categoryId = Number(category_id), stockCount = Number(stock);
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 255 || !Number.isSafeInteger(salePrice) || salePrice <= 0 ||
      (listPrice !== null && (!Number.isSafeInteger(listPrice) || listPrice < salePrice)) ||
      !Number.isInteger(categoryId) || categoryId < 1 || !Number.isInteger(stockCount) || stockCount < 0)
    return res.status(400).json({ error: 'Tên, giá, danh mục hoặc tồn kho không hợp lệ.' });
  // Lưu đường dẫn tương đối để frontend có thể dùng trực tiếp
  const image_url = req.file ? `/images/products/${req.file.filename}` : null;
  const sql =
    "INSERT INTO products (name, price, original_price, stock, description, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [name.trim(), salePrice, listPrice, stockCount, description, image_url, categoryId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, name, price, image_url });
    },
  );
});

// --- AUTH ---
app.post("/api/auth/login", authLimiter, async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password || password.length > 256) return res.status(400).json({ message: 'Email hoặc mật khẩu không hợp lệ.' });
  if (password === '123456') return res.status(401).json({ message: 'Mật khẩu mặc định đã bị vô hiệu hóa. Hãy đặt mật khẩu mới cho tài khoản.' });
  try {
    const [users] = await db.promise().query('SELECT id, email, password_hash, full_name, role FROM users WHERE email = ? LIMIT 1', [email]);
    const user = users[0];
    if (!user || !verifyPassword(password, user.password_hash)) return res.status(401).json({ message: 'Email hoặc mật khẩu sai.' });
    const token = issueToken(user.id);
    if (!user.password_hash.startsWith('scrypt$')) {
      await db.promise().query('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(password), user.id]);
    }
    return res.json({ id: user.id, name: user.full_name, email: user.email, role: user.role, token });
  } catch (error) {
    if (error.message.includes('AUTH_TOKEN_SECRET')) return res.status(503).json({ message: error.message });
    return res.status(500).json({ message: 'Không thể đăng nhập lúc này.' });
  }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 256)
    return res.status(400).json({ message: 'Tên, email hoặc mật khẩu không hợp lệ (mật khẩu tối thiểu 8 ký tự).' });
  try {
    issueToken(1); // Validate server signing configuration before creating the account.
    const [result] = await db.promise().query(
      "INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, 'customer')",
      [email, hashPassword(password), name]);
    return res.status(201).json({ id: result.insertId, name, email, role: 'customer', token: issueToken(result.insertId) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email này đã được đăng ký.' });
    if (error.message.includes('AUTH_TOKEN_SECRET')) return res.status(503).json({ message: error.message });
    return res.status(500).json({ message: 'Không thể tạo tài khoản lúc này.' });
  }
});

app.get('/api/auth/me', requireUser, (req, res) => res.json(req.user));

// --- ORDERS: Create ---
app.post("/api/orders", optionalUser, async (req, res) => {
  const { items, shipping_name, shipping_address, shipping_phone } = req.body;
  const paymentMethod = req.body.payment_method || 'cod';
  if (!Array.isArray(items) || !items.length || items.length > 50 ||
      typeof shipping_name !== 'string' || !shipping_name.trim() || shipping_name.trim().length > 100 ||
      typeof shipping_address !== 'string' || !shipping_address.trim() || shipping_address.trim().length > 2000 ||
      typeof shipping_phone !== 'string' || !shipping_phone.trim() || shipping_phone.trim().length > 30 ||
      !['cod', 'momo', 'vnpay', 'bank'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Thông tin đơn hàng không hợp lệ.' });
  }
  const normalized = new Map();
  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item))
      return res.status(400).json({ error: 'Dữ liệu sản phẩm không hợp lệ.' });
    const id = Number(item.id), quantity = Number(item.quantity);
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99)
      return res.status(400).json({ error: 'Sản phẩm hoặc số lượng không hợp lệ.' });
    normalized.set(id, (normalized.get(id) || 0) + quantity);
  }
  if ([...normalized.values()].some(quantity => quantity > 99))
    return res.status(400).json({ error: 'Số lượng tối đa cho mỗi sản phẩm là 99.' });

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    const productIds = [...normalized.keys()];
    const [products] = await connection.query(
      `SELECT id, name, price, original_price, stock FROM products WHERE id IN (${productIds.map(() => '?').join(',')}) AND is_active = 1 FOR UPDATE`, productIds);
    if (products.length !== productIds.length) throw Object.assign(new Error('Một sản phẩm không còn khả dụng.'), { status: 409 });

    const productById = new Map(products.map(p => [Number(p.id), p]));
    const orderLines = [];
    let total = 0;
    for (const [id, quantity] of normalized) {
      const product = productById.get(id);
      if (Number(product.stock) < quantity) throw Object.assign(new Error(`Sản phẩm ${product.name} không đủ tồn kho.`), { status: 409 });
      const [sales] = await connection.query(`
        SELECT fsi.id, fsi.flash_price FROM flash_sale_items fsi
        JOIN flash_sales fs ON fs.id = fsi.flash_sale_id
        WHERE fsi.product_id = ? AND fs.is_active = 1
          AND NOW() BETWEEN fs.start_time AND fs.end_time
          AND fsi.sold_quantity + ? <= fsi.quantity
        ORDER BY fsi.flash_price ASC, fs.end_time ASC LIMIT 1 FOR UPDATE`, [id, quantity]);
      const unitPrice = sales.length ? Number(sales[0].flash_price) : Number(product.price);
      if (!Number.isSafeInteger(unitPrice)) throw Object.assign(new Error(`Giá sản phẩm ${product.name} không hợp lệ.`), { status: 409 });
      total += unitPrice * quantity;
      orderLines.push({ id, name: product.name, quantity, unitPrice, saleItemId: sales[0]?.id || null });
    }
    if (!Number.isSafeInteger(total)) throw Object.assign(new Error('Tổng tiền đơn hàng vượt giới hạn.'), { status: 400 });

    const finalUserId = req.user?.id || null;
    const paymentStatus = paymentMethod === 'cod' ? 'pending_cod' : 'pending';
    const checkoutToken = ['momo', 'vnpay'].includes(paymentMethod) ? crypto.randomBytes(32).toString('hex') : null;
    const checkoutTokenHash = checkoutToken ? crypto.createHash('sha256').update(checkoutToken).digest('hex') : null;
    const [order] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, shipping_name, shipping_address, shipping_phone, payment_method, payment_status, payment_ref)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalUserId, total, shipping_name.trim(), shipping_address.trim(), shipping_phone.trim(), paymentMethod, paymentStatus, checkoutTokenHash]);

    for (const line of orderLines) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, flash_sale_item_id, product_name, quantity, price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [order.insertId, line.id, line.saleItemId, line.name, line.quantity, line.unitPrice, line.unitPrice * line.quantity]);
      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [line.quantity, line.id]);
      if (line.saleItemId) {
        const [reserved] = await connection.query(
          'UPDATE flash_sale_items SET sold_quantity = sold_quantity + ? WHERE id = ? AND sold_quantity + ? <= quantity',
          [line.quantity, line.saleItemId, line.quantity]);
        if (!reserved.affectedRows) throw Object.assign(new Error('Ưu đãi Flash Sale vừa hết. Vui lòng thử lại.'), { status: 409 });
      }
    }
    await connection.commit();
    return res.status(201).json({ message: 'Đặt hàng thành công', orderId: order.insertId, total_amount: total, checkout_token: checkoutToken });
  } catch (error) {
    await connection.rollback();
    return res.status(error.status || 500).json({ error: error.status ? error.message : 'Không thể tạo đơn hàng.' });
  } finally { connection.release(); }
});

// --- ORDERS: User - get order history with items ---
app.get("/api/orders", requireUser, async (req, res) => {
  const userId = req.user.id;
  try {
    const [orders] = await db.promise().query(`
      SELECT o.*
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);

    if (!orders.length) {
      return res.json([]);
    }

    const orderIds = orders.map(o => o.id);
    const [items] = await db.promise().query(`
      SELECT oi.*, p.image_url, COALESCE(oi.product_name, p.name) AS product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})
    `, orderIds);

    const itemsByOrder = new Map();
    items.forEach(item => {
      if (!itemsByOrder.has(item.order_id)) {
        itemsByOrder.set(item.order_id, []);
      }
      itemsByOrder.get(item.order_id).push(item);
    });

    const result = orders.map(o => ({
      ...o,
      items: itemsByOrder.get(o.id) || []
    }));

    return res.json(result);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ error: 'Không thể lấy lịch sử đơn hàng.' });
  }
});

// --- ORDERS: Admin - get all (MUST be before /:id route) ---
app.get("/api/orders/admin", requireAdmin, (req, res) => {
  const sql = `
        SELECT o.*, u.full_name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- ORDERS: Admin - delete order ---
app.delete("/api/orders/:id", requireAdmin, async (req, res) => {
  const orderId = req.params.id;
  if (!/^\d+$/.test(orderId)) return res.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' });
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.query('SELECT id, status FROM orders WHERE id = ?', [orderId]);
    if (!orders.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
    }
    // Restore stock if order was not cancelled
    if (orders[0].status !== 'cancelled') {
      const [items] = await connection.query(
        'SELECT product_id, flash_sale_item_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of items) {
        if (item.product_id) await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        if (item.flash_sale_item_id) await connection.query(
          'UPDATE flash_sale_items SET sold_quantity = GREATEST(sold_quantity - ?, 0) WHERE id = ?',
          [item.quantity, item.flash_sale_item_id]);
      }
    }
    await connection.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    await connection.query('DELETE FROM orders WHERE id = ?', [orderId]);
    await connection.commit();
    return res.json({ success: true, message: 'Đã xóa đơn hàng thành công.' });
  } catch (err) {
    await connection.rollback();
    console.error('[Delete order error]', err);
    return res.status(500).json({ error: 'Lỗi khi xóa đơn hàng: ' + err.message });
  } finally {
    connection.release();
  }
});

// --- ORDERS: User/Admin - get order detail with items ---
app.get("/api/orders/:id", requireUser, async (req, res) => {
  const orderId = req.params.id;
  if (!/^\d+$/.test(orderId)) return res.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' });
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  try {
    const [orders] = await db.promise().query(`
      SELECT o.*, u.full_name, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ? ${isAdmin ? '' : 'AND o.user_id = ?'}
    `, isAdmin ? [orderId] : [orderId, userId]);

    if (!orders.length) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
    }

    const [items] = await db.promise().query(`
      SELECT oi.*, p.image_url, COALESCE(oi.product_name, p.name) AS product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);

    return res.json({
      ...orders[0],
      items
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return res.status(500).json({ error: 'Không thể lấy chi tiết đơn hàng.' });
  }
});

// --- ORDERS: Update status ---
app.patch("/api/orders/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Trạng thái không hợp lệ" });
  }
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.query('SELECT status FROM orders WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!orders.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
    }
    if (orders[0].status === 'cancelled' && status !== 'cancelled') {
      await connection.rollback();
      return res.status(409).json({ error: 'Đơn đã hủy không thể mở lại; vui lòng tạo đơn mới.' });
    }
    if (status === 'cancelled' && orders[0].status !== 'cancelled') {
      const [items] = await connection.query(
        'SELECT product_id, flash_sale_item_id, quantity FROM order_items WHERE order_id = ? FOR UPDATE', [req.params.id]);
      for (const item of items) {
        if (item.product_id) await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        if (item.flash_sale_item_id) await connection.query(
          'UPDATE flash_sale_items SET sold_quantity = GREATEST(sold_quantity - ?, 0) WHERE id = ?',
          [item.quantity, item.flash_sale_item_id]);
      }
    }
    await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    await connection.commit();
    return res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng' });
  } catch (error) {
    await connection.rollback();
    console.error('[Order status update]', error.message);
    return res.status(500).json({ error: 'Không thể cập nhật trạng thái đơn hàng.' });
  } finally { connection.release(); }
});

app.get('/api/orders/:id/payment-status', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' });
  try {
    const [rows] = await db.promise().query('SELECT payment_status, payment_method FROM orders WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
    return res.json(rows[0]);
  } catch { return res.status(500).json({ error: 'Không thể kiểm tra thanh toán.' }); }
});

// --- ORDERS: Payment success confirmation ---
// --- USERS / CUSTOMERS ---
app.get("/api/users", requireAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT u.id, u.full_name as name, u.email, u.role, u.phone, u.address, u.created_at as joinDate,
             COUNT(o.id) as totalOrders, COALESCE(SUM(o.total_amount), 0) as totalSpent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    const [users] = await db.promise().query(sql);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/users/:id", requireAdmin, async (req, res) => {
  const { name, role } = req.body;
  try {
    await db.promise().query(
      "UPDATE users SET full_name = ?, role = ? WHERE id = ?",
      [name, role, req.params.id]
    );
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/users/:id", requireAdmin, async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId < 1) {
    return res.status(400).json({ message: "Mã người dùng không hợp lệ" });
  }

  // Prevent admin from deleting their own account
  if (req.user && req.user.id === targetId) {
    return res.status(400).json({ message: "Không thể tự xóa tài khoản của chính bạn đang đăng nhập." });
  }

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const [users] = await connection.query("SELECT id, role, email FROM users WHERE id = ?", [targetId]);
    if (!users.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // 1. Delete user cart items
    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [targetId]);

    // 2. Safely decouple orders (preserve company order history)
    await connection.query("UPDATE orders SET user_id = NULL WHERE user_id = ?", [targetId]);

    // 3. Safely decouple reviews
    await connection.query("UPDATE reviews SET user_id = NULL WHERE user_id = ?", [targetId]);

    // 4. Delete user
    await connection.query("DELETE FROM users WHERE id = ?", [targetId]);

    await connection.commit();
    return res.json({ success: true, message: "Đã xóa người dùng thành công." });
  } catch (err) {
    await connection.rollback();
    console.error("[Delete user error]", err);
    return res.status(500).json({ message: "Lỗi hệ thống khi xóa người dùng: " + err.message });
  } finally {
    connection.release();
  }
});

// --- DASHBOARD STATS ---
app.get("/api/dashboard/stats", requireAdmin, async (req, res) => {
  try {
    const pool = db.promise();
    const [productsCount] = await pool.query("SELECT COUNT(*) as count FROM products");
    const [ordersData] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    const [topProducts] = await pool.query(`
      SELECT product_name as name, SUM(quantity) as quantity, SUM(total_price) as revenue
      FROM order_items
      GROUP BY product_name
      ORDER BY quantity DESC
      LIMIT 5
    `);

    const orders = ordersData || [];
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const uniqueCustomers = new Set(
      orders
        .map((o) => `${o.shipping_name || ""}_${o.shipping_phone || ""}`)
        .filter((k) => k !== "_"),
    );

    const now = new Date();
    const weekly = [0, 0, 0, 0, 0, 0, 0];
    orders.forEach((o) => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) {
        const dow = d.getDay();
        const idx = dow === 0 ? 6 : dow - 1;
        weekly[idx]++;
      }
    });

    res.json({
      revenue: totalRevenue,
      orders: orders.length,
      customers: uniqueCustomers.size,
      products: productsCount[0].count,
      topProducts:
        topProducts && topProducts.length > 0
          ? topProducts
          : [
              { name: "Nồi Inox Cao Cấp", quantity: 33, revenue: 14850000 },
              { name: "Dao Bếp Chef", quantity: 5, revenue: 1600000 },
              { name: "Thìa Inox", quantity: 4, revenue: 180000 },
              { name: "Chảo Chống Dính", quantity: 1, revenue: 380000 },
            ],
      weekly,
      recentOrders: orders.slice(0, 5).map((o) => ({
        id: o.id,
        customer: o.shipping_name || "Khách vãng lai",
        date: o.created_at
          ? new Date(o.created_at).toLocaleDateString("vi-VN")
          : "—",
        total: Number(o.total_amount || 0),
        status: o.status || "pending",
        payment_method: o.payment_method,
        payment_status: o.payment_status,
      })),
    });
  } catch (err) {
    console.error("[Dashboard Stats Error]", err);
    res.status(500).json({ error: err.message });
  }
});

// --- MOMO: Create payment ---
app.post("/api/payment/momo/create", async (req, res) => {
  const { orderInfo, orderId, checkout_token } = req.body;
  if (!Number.isInteger(Number(orderId)) || Number(orderId) < 1) return res.status(400).json({ error: "Mã đơn hàng không hợp lệ" });
  if (typeof checkout_token !== 'string' || checkout_token.length !== 64) return res.status(403).json({ error: 'Token thanh toán không hợp lệ.' });
  try {
    const [orders] = await db.promise().query("SELECT total_amount,payment_ref FROM orders WHERE id = ? AND payment_method = 'momo' AND payment_status = 'pending'", [orderId]);
    const expected = orders[0]?.payment_ref ? Buffer.from(orders[0].payment_ref, 'hex') : Buffer.alloc(0);
    const supplied = crypto.createHash('sha256').update(checkout_token).digest();
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return res.status(403).json({ error: 'Token thanh toán không hợp lệ.' });
    if (!orders.length) return res.status(404).json({ error: 'Không tìm thấy đơn MoMo đang chờ thanh toán.' });
    const result = await momoPayment.createMomoPayment(
      Math.round(Number(orders[0].total_amount)),
      orderInfo || "Thanh toán EuroAsia Kitchen",
      orderId,
    );
    res.json({ success: true, payUrl: result.payUrl });
  } catch (err) {
    console.error("[MoMo Create Error]", err);
    res.status(500).json({ error: "Lỗi MoMo: " + err.message });
  }
});

// --- MOMO: IPN callback ---
app.post("/api/payment/momo/ipn", async (req, res) => {
  try {
    if (!payment.verifyMomoCallback(req.body) || Number(req.body.resultCode) !== 0) return res.status(204).send();
    const orderId = String(req.body.orderId || '').split('_')[0];
    if (!/^\d+$/.test(orderId)) return res.status(204).send();
    const [orders] = await db.promise().query("SELECT total_amount FROM orders WHERE id = ? AND payment_method = 'momo' AND payment_status = 'pending'", [orderId]);
    if (orders.length && Math.round(Number(orders[0].total_amount)) === Number(req.body.amount)) {
      await db.promise().query("UPDATE orders SET payment_status = 'paid', payment_ref = ? WHERE id = ? AND payment_status = 'pending'", [String(req.body.transId || ''), orderId]);
    }
  } catch (error) { console.error('[MoMo IPN]', error.message); }
  return res.status(204).send();
});

// --- MOMO: Return verification from frontend (Handles environments where MoMo IPN cannot reach localhost) ---
app.post("/api/payment/momo/verify-return", async (req, res) => {
  const { orderId, resultCode, transId, amount } = req.body;
  const rawId = String(orderId || '').split('_')[0];
  if (!/^\d+$/.test(rawId)) return res.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' });

  if (String(resultCode) === '0' || Number(resultCode) === 0) {
    try {
      const [orders] = await db.promise().query("SELECT id, total_amount, payment_status FROM orders WHERE id = ?", [rawId]);
      if (!orders.length) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });

      await db.promise().query(
        "UPDATE orders SET payment_status = 'paid', status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END, payment_ref = COALESCE(?, payment_ref) WHERE id = ?",
        [transId ? String(transId) : 'momo_paid', rawId]
      );
      return res.json({ success: true, message: 'Đã xác nhận thanh toán MoMo thành công!' });
    } catch (err) {
      console.error('[MoMo verify return error]', err);
      return res.status(500).json({ error: 'Lỗi cập nhật trạng thái đơn hàng.' });
    }
  } else {
    return res.status(400).json({ error: 'Giao dịch MoMo không thành công.' });
  }
});

// --- ORDERS: Pay success confirmation fallback ---
app.post("/api/orders/:id/pay-success", async (req, res) => {
  const orderId = req.params.id;
  if (!/^\d+$/.test(orderId)) return res.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' });
  try {
    await db.promise().query(
      "UPDATE orders SET payment_status = 'paid', status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END WHERE id = ?",
      [orderId]
    );
    return res.json({ success: true, message: 'Thanh toán thành công' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- VNPAY: Create payment URL ---
app.post("/api/payment/vnpay/create", (req, res) => {
  const { orderInfo, orderId, checkout_token } = req.body;
  if (!Number.isInteger(Number(orderId)) || Number(orderId) < 1) return res.status(400).json({ error: "Mã đơn hàng không hợp lệ" });
  if (typeof checkout_token !== 'string' || checkout_token.length !== 64) return res.status(403).json({ error: 'Token thanh toán không hợp lệ.' });
  const ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    "127.0.0.1";
  db.promise().query("SELECT total_amount,payment_ref FROM orders WHERE id = ? AND payment_method = 'vnpay' AND payment_status = 'pending'", [orderId]).then(([orders]) => {
    if (!orders.length) return res.status(404).json({ error: 'Không tìm thấy đơn VNPay đang chờ thanh toán.' });
    const expected = orders[0].payment_ref ? Buffer.from(orders[0].payment_ref, 'hex') : Buffer.alloc(0);
    const supplied = crypto.createHash('sha256').update(checkout_token).digest();
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return res.status(403).json({ error: 'Token thanh toán không hợp lệ.' });
    try {
    const result = vnpayPayment.createVnpayPayment(
      Math.round(Number(orders[0].total_amount)),
      orderInfo || "Thanh toán EuroAsia Kitchen",
      ipAddr,
      orderId,
    );
    res.json({ success: true, paymentUrl: result.paymentUrl });
  } catch (err) {
    console.error("[VNPay Create Error]", err);
    res.status(500).json({ error: "Lỗi VNPay: " + err.message });
  }
  }).catch(() => res.status(500).json({ error: 'Không thể tạo thanh toán VNPay.' }));
});

// --- VNPAY: Return URL handler ---
app.get("/api/payment/vnpay/return", async (req, res) => {
  const isValid = vnpayPayment.verifyVnpayCallback(req.query);
  const responseCode = req.query["vnp_ResponseCode"];
  const txnRef = req.query["vnp_TxnRef"] || "";
  const orderId = txnRef.split("_")[0];
  const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || "http://localhost:3000";

  let paid = false;
  if (isValid && responseCode === "00" && /^\d+$/.test(orderId)) {
    try {
      const [orders] = await db.promise().query("SELECT total_amount FROM orders WHERE id = ? AND payment_method = 'vnpay' AND payment_status = 'pending'", [orderId]);
      paid = orders.length > 0 && Number(req.query.vnp_Amount) === Math.round(Number(orders[0].total_amount)) * 100;
      if (paid) await db.promise().query("UPDATE orders SET payment_status = 'paid', payment_ref = ? WHERE id = ? AND payment_status = 'pending'", [String(req.query.vnp_TransactionNo || ''), orderId]);
    } catch (error) { console.error('[VNPay return]', error.message); }
  }
  if (paid) {
    res.redirect(
      `${frontendUrl}/checkout/payment-result?status=success&method=vnpay&orderId=${orderId}`,
    );
  } else {
    res.redirect(
      `${frontendUrl}/checkout/payment-result?status=failed&method=vnpay&orderId=${orderId}`,
    );
  }
});

// --- COD: Confirm order ---
app.post("/api/payment/cod/confirm", (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: "Thiếu orderId" });
  db.query(
    "UPDATE orders SET payment_status = 'pending_cod', payment_method = 'cod' WHERE id = ?",
    [orderId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: "Đơn hàng COD đã được xác nhận" });
    },
  );
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error instanceof multer.MulterError
    ? (error.code === 'LIMIT_FILE_SIZE' ? 413 : 400)
    : (Number(error.status) >= 400 && Number(error.status) < 500 ? Number(error.status) : 500);
  if (status >= 500) console.error('[API error]', error.message);
  return res.status(status).json({ error: status === 500 ? 'Lỗi máy chủ.' : error.message });
});

// Khởi chạy server
initializeSchema().catch((error) => {
  console.error("Database schema initialization failed:", error.message);
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
