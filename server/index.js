const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors()); // Cho phép Frontend gọi vào
app.use(express.json()); // Để đọc dữ liệu JSON gửi lên (ví dụ lúc thêm sản phẩm)
app.use(express.static('public')); // Serve static files from the 'public' directory

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save to public/images/products so frontend can access it directly
        cb(null, 'public/images/products');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ================= ROUTES ================= //

// --- CATEGORIES ---
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
    const { categoryId } = req.query;
    let sql = 'SELECT * FROM products';
    let params = [];
    if (categoryId) {
        sql += ' WHERE category_id = ?';
        params.push(categoryId);
    }
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/products/:id', (req, res) => {
    db.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        res.json(results[0]);
    });
});

app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, price, description, category_id } = req.body;
    const image_url = req.file ? `/images/products/${req.file.filename}` : null;
    const sql = 'INSERT INTO products (name, price, description, image_url, category_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, price, description, image_url, category_id || 1], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, name, price, image_url });
    });
});

// --- AUTH (Đơn giản hóa cho demo) ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });

        const user = results[0];
        // Trong thực tế nên dùng bcrypt để check password_hash
        if (password === '123456') { // Mock check
            res.json({ id: user.id, name: user.full_name, email: user.email, role: user.role, token: 'mock-jwt-token' });
        } else {
            res.status(401).json({ message: 'Mật khẩu sai' });
        }
    });
});

// --- ORDERS ---
app.post('/api/orders', (req, res) => {
    const { user_id, total_amount, items, shipping_name, shipping_address, shipping_phone } = req.body;

    // 1. Tạo đơn hàng
    const orderSql = 'INSERT INTO orders (user_id, total_amount, shipping_name, shipping_address, shipping_phone) VALUES (?, ?, ?, ?, ?)';
    db.query(orderSql, [user_id, total_amount, shipping_name, shipping_address, shipping_phone], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const orderId = result.insertId;
        // 2. Thêm chi tiết đơn hàng (giả sử có items là array)
        const itemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price, total_price) VALUES ?';
        const values = items.map(item => [orderId, item.id, item.quantity, item.price, item.quantity * item.price]);

        db.query(itemSql, [values], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Đặt hàng thành công', orderId });
        });
    });
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
