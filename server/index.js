const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('./db');
const payment = require('./payment');
const momoPayment = require('./payment/momo');
const vnpayPayment = require('./payment/vnpay');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL // Domain Vercel
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed by DevOps'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// --- Cloudinary Configuration ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'euroasia-products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
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
    // Lấy URL từ Cloudinary thay vì path local
    const image_url = req.file ? req.file.path : null; 
    const sql = 'INSERT INTO products (name, price, description, image_url, category_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, price, description, image_url, category_id || 1], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, name, price, image_url });
    });
});

// --- AUTH ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });

        const user = results[0];
        if (password === '123456') {
            res.json({ id: user.id, name: user.full_name, email: user.email, role: user.role, token: 'mock-jwt-token' });
        } else {
            res.status(401).json({ message: 'Mật khẩu sai' });
        }
    });
});

// --- ORDERS: Create ---
app.post('/api/orders', (req, res) => {
    const { user_id, total_amount, items, shipping_name, shipping_address, shipping_phone } = req.body;

    console.log('--- Đang tạo đơn hàng mới ---');
    console.log('Dữ liệu nhận được:', { user_id, total_amount, itemsCount: items.length });

    // Kiểm tra xem user_id có tồn tại trong bảng users không
    db.query('SELECT id FROM users WHERE id = ?', [user_id], (uErr, uResults) => {
        let finalUserId = user_id;
        if (uErr || uResults.length === 0) {
            console.warn(`[Warning] User ID ${user_id} không tồn tại. Đang đặt là NULL.`);
            finalUserId = null;
        }

        const orderSql = 'INSERT INTO orders (user_id, total_amount, shipping_name, shipping_address, shipping_phone) VALUES (?, ?, ?, ?, ?)';
        db.query(orderSql, [finalUserId, total_amount, shipping_name, shipping_address, shipping_phone], (err, result) => {
            if (err) {
                console.error('Lỗi khi INSERT vào bảng orders:', err);
                return res.status(500).json({ error: 'Lỗi Database Orders: ' + err.message });
            }

            const orderId = result.insertId;
            console.log('Đã tạo Order ID:', orderId);

            const itemSql = 'INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total_price) VALUES ?';
            const values = items.map(item => [
                orderId, 
                item.id, 
                item.name || 'Sản phẩm', 
                item.quantity, 
                item.price, 
                item.quantity * item.price
            ]);

            db.query(itemSql, [values], (err) => {
                if (err) {
                    console.error('Lỗi khi INSERT vào bảng order_items:', err);
                    return res.status(500).json({ error: 'Lỗi Database Order Items: ' + err.message });
                }
                console.log('Đặt hàng thành công!');
                res.status(201).json({ message: 'Đặt hàng thành công', orderId });
            });
        });
    });
});

// --- ORDERS: Admin - get all ---
app.get('/api/orders/admin', (req, res) => {
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

// --- ORDERS: Update status ---
app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng' });
        }
    );
});

// ============================================================
// PAYMENT ROUTES
// ============================================================

// --- MOMO: Create payment ---
app.post('/api/payment/momo/create', async (req, res) => {
    const { amount, orderInfo, orderId } = req.body;
    if (!amount) return res.status(400).json({ error: 'Thiếu số tiền' });
    
    try {
        const result = await momoPayment.createMomoPayment(
            amount,
            orderInfo || `Thanh toán EuroAsia Kitchen`,
            orderId
        );
        res.json({ success: true, payUrl: result.payUrl });
    } catch (err) {
        console.error('[MoMo Create Error]', err);
        res.status(500).json({ error: 'Lỗi MoMo: ' + err.message });
    }
});

// --- MOMO: IPN callback ---
app.post('/api/payment/momo/ipn', (req, res) => {
    const isValid = payment.verifyMomoCallback(req.body);
    if (isValid && req.body.resultCode === 0) {
        const orderId = req.body.orderId.split('_')[0];
        db.query(
            "UPDATE orders SET payment_status = 'paid', payment_method = 'momo' WHERE id = ?",
            [orderId],
            () => {}
        );
    }
    res.status(204).send();
});

// --- VNPAY: Create payment URL ---
app.post('/api/payment/vnpay/create', (req, res) => {
    const { amount, orderInfo, orderId } = req.body;
    if (!amount) return res.status(400).json({ error: 'Thiếu số tiền' });

    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
    
    try {
        const result = vnpayPayment.createVnpayPayment(
            amount,
            orderInfo || `Thanh toán EuroAsia Kitchen`,
            ipAddr,
            orderId
        );
        res.json({ success: true, paymentUrl: result.paymentUrl });
    } catch (err) {
        console.error('[VNPay Create Error]', err);
        res.status(500).json({ error: 'Lỗi VNPay: ' + err.message });
    }
});

// --- VNPAY: Return URL handler ---
app.get('/api/payment/vnpay/return', (req, res) => {
    const isValid = payment.verifyVnpayCallback(req.query);
    const responseCode = req.query['vnp_ResponseCode'];
    const txnRef = req.query['vnp_TxnRef'] || '';
    const orderId = txnRef.split('_')[0];
    const frontendUrl = process.env.BASE_URL || 'http://localhost:3000';

    if (isValid && responseCode === '00') {
        db.query(
            "UPDATE orders SET payment_status = 'paid', payment_method = 'vnpay' WHERE id = ?",
            [orderId],
            () => {}
        );
        res.redirect(`${frontendUrl}/checkout/payment-result?status=success&method=vnpay&orderId=${orderId}`);
    } else {
        res.redirect(`${frontendUrl}/checkout/payment-result?status=failed&method=vnpay&orderId=${orderId}`);
    }
});

// --- COD: Confirm order ---
app.post('/api/payment/cod/confirm', (req, res) => {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'Thiếu orderId' });
    db.query(
        "UPDATE orders SET payment_status = 'pending_cod', payment_method = 'cod' WHERE id = ?",
        [orderId],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Đơn hàng COD đã được xác nhận' });
        }
    );
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
