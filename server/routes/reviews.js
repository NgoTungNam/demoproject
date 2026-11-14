/**
 * Reviews & Feedback Router for EuroAsia Kitchen
 * Handles 1-5 star ratings, customer feedback, review images, verified purchase checks,
 * sorting, and admin moderation.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { requireAdmin, requireUser } = require('../auth');

const router = express.Router();

// Multer storage for review images
const reviewUploadDir = path.join(__dirname, '../../public/images/reviews');
if (!fs.existsSync(reviewUploadDir)) {
  fs.mkdirSync(reviewUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, reviewUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `review-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp)$/i.test(path.extname(file.originalname)) && /^image\/(jpeg|png|webp)$/.test(file.mimetype);
    cb(allowed ? null : new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.'), allowed);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * Helper to update rating_average and review_count on products table
 */
async function updateProductRatingStats(pool, productId) {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COALESCE(AVG(rating), 0) AS avg_rating,
        COUNT(*) AS count
      FROM reviews
      WHERE product_id = ? AND status = 'approved'
    `, [productId]);

    const avg = parseFloat(stats[0].avg_rating || 0).toFixed(2);
    const count = parseInt(stats[0].count || 0);

    await pool.query(`
      UPDATE products 
      SET rating_average = ?, review_count = ?
      WHERE id = ?
    `, [avg, count, productId]);
  } catch (err) {
    console.error(`Lỗi cập nhật rating stats cho sản phẩm ${productId}:`, err);
  }
}

router.use((req, res, next) => {
  const pathname = req.path;
  const adminPath = pathname.startsWith('/admin/') || pathname.startsWith('/reviews/admin/') ||
    (/^\/reviews\/\d+\/(approve|hide)$/.test(pathname)) ||
    (req.method === 'DELETE' && /^\/reviews\/\d+$/.test(pathname));
  return adminPath ? requireAdmin(req, res, next) : next();
});

/**
 * GET /api/products/:id/reviews
 * Get approved reviews for a product with sorting and distribution stats
 * Query: ?sort=newest|highest|lowest
 */
router.get('/products/:id/reviews', async (req, res) => {
  const pool = db.promise();
  const productId = req.params.id;
  const { sort = 'newest' } = req.query;

  let orderBy = 'created_at DESC';
  if (sort === 'highest') orderBy = 'rating DESC, created_at DESC';
  if (sort === 'lowest') orderBy = 'rating ASC, created_at DESC';

  try {
    // 1. Lấy danh sách reviews đã duyệt
    const [reviews] = await pool.query(`
      SELECT id, product_id, user_id, user_name, rating, comment, image_url, 
             is_verified_purchase, status, created_at
      FROM reviews
      WHERE product_id = ? AND status = 'approved'
      ORDER BY ${orderBy}
    `, [productId]);

    // 2. Thống kê phân bố sao (1 đến 5)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScore = 0;

    reviews.forEach(r => {
      const star = r.rating;
      if (distribution[star] !== undefined) {
        distribution[star]++;
      }
      totalScore += star;
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? (totalScore / totalReviews).toFixed(1) : '0.0';

    return res.json({
      reviews,
      stats: {
        total_reviews: totalReviews,
        average_rating: parseFloat(averageRating),
        distribution,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy reviews sản phẩm:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/products/:id/reviews
 * Submit a customer review with optional image upload
 */
router.post('/products/:id/reviews', requireUser, upload.single('image'), async (req, res) => {
  const pool = db.promise();
  const productId = req.params.id;
  const { rating, comment } = req.body;

  // 1. Validation
  const star = parseInt(rating);
  if (!star || star < 1 || star > 5) {
    return res.status(400).json({ error: 'Điểm đánh giá phải từ 1 đến 5 sao.' });
  }

  const cleanName = String(req.user.name || req.user.email).trim();
  if (!cleanName) {
    return res.status(400).json({ error: 'Vui lòng cung cấp họ tên người đánh giá.' });
  }

  const cleanComment = (comment || '').trim();
  if (cleanComment.length < 5) {
    return res.status(400).json({ error: 'Nội dung nhận xét tối thiểu từ 5 ký tự.' });
  }

  const imageUrl = req.file ? `/images/reviews/${req.file.filename}` : null;
  const cleanEmail = req.user.email;
  const numericUserId = req.user.id;

  try {
    const [product] = await pool.query('SELECT id FROM products WHERE id = ? AND is_active = 1', [productId]);
    if (!product.length) return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    const [existing] = await pool.query('SELECT id FROM reviews WHERE product_id = ? AND user_id = ? LIMIT 1', [productId, numericUserId]);
    if (existing.length) return res.status(409).json({ error: 'Bạn đã đánh giá sản phẩm này.' });

    // 3. Kiểm tra Verified Purchase (Đã mua hàng thực tế)
    let isVerifiedPurchase = false;
    if (numericUserId || cleanEmail) {
      const [orders] = await pool.query(`
        SELECT o.id 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'delivered'
        LIMIT 1
      `, [productId, numericUserId]);

      if (orders.length > 0) {
        isVerifiedPurchase = true;
      }
    }
    if (!isVerifiedPurchase) return res.status(403).json({ error: 'Chỉ tài khoản đã nhận sản phẩm này mới có thể gửi đánh giá.' });

    // 4. Lưu đánh giá vào database
    const [insertResult] = await pool.query(`
      INSERT INTO reviews (product_id, user_id, user_name, user_email, rating, comment, image_url, is_verified_purchase, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved')
    `, [productId, numericUserId, cleanName, cleanEmail, star, cleanComment, imageUrl, isVerifiedPurchase]);

    // 5. Cập nhật lại rating stats trên products
    await updateProductRatingStats(pool, productId);

    return res.status(201).json({
      success: true,
      message: 'Gửi đánh giá thành công! Cảm ơn phản hồi quý báu của bạn.',
      review_id: insertResult.insertId,
      is_verified_purchase: isVerifiedPurchase,
      image_url: imageUrl,
    });
  } catch (error) {
    console.error('Lỗi khi lưu review:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/reviews
 * Admin: Lấy tất cả đánh giá để kiểm duyệt
 */
router.get('/admin/reviews', async (req, res) => {
  const pool = db.promise();
  const { status, rating, productId } = req.query;

  let sql = `
    SELECT r.*, p.name AS product_name, p.image_url AS product_image
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'all') {
    sql += ' AND r.status = ?';
    params.push(status);
  }
  if (rating) {
    sql += ' AND r.rating = ?';
    params.push(rating);
  }
  if (productId) {
    sql += ' AND r.product_id = ?';
    params.push(productId);
  }

  sql += ' ORDER BY r.created_at DESC';

  try {
    const [reviews] = await pool.query(sql, params);
    return res.json(reviews);
  } catch (error) {
    console.error('Lỗi khi lấy reviews cho Admin:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/reviews/:id/status
 * Admin: Thay đổi trạng thái review (approved / hidden)
 */
router.patch('/admin/reviews/:id/status', async (req, res) => {
  const pool = db.promise();
  const reviewId = req.params.id;
  const { status } = req.body;

  if (!['approved', 'hidden'].includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ (approved hoặc hidden).' });
  }

  try {
    const [rev] = await pool.query('SELECT product_id FROM reviews WHERE id = ?', [reviewId]);
    if (rev.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đánh giá.' });
    }

    await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, reviewId]);
    await updateProductRatingStats(pool, rev[0].product_id);

    return res.json({ success: true, message: `Đã chuyển trạng thái đánh giá sang: ${status}` });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái review:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/reviews/:id
 * Admin: Xóa đánh giá vi phạm
 */
router.delete('/admin/reviews/:id', async (req, res) => {
  const pool = db.promise();
  const reviewId = req.params.id;

  try {
    const [rev] = await pool.query('SELECT product_id FROM reviews WHERE id = ?', [reviewId]);
    if (rev.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đánh giá.' });
    }

    const productId = rev[0].product_id;
    await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
    await updateProductRatingStats(pool, productId);

    return res.json({ success: true, message: 'Đã xóa đánh giá vi phạm.' });
  } catch (error) {
    console.error('Lỗi xóa review:', error);
    return res.status(500).json({ error: error.message });
  }
});

// === Alias routes matching frontend calls ===

// GET /api/reviews/product/:id  (frontend calls this)
router.get('/reviews/product/:id', async (req, res) => {
  const pool = db.promise();
  const productId = req.params.id;
  const { sort = 'newest' } = req.query;
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);
  let orderBy = 'r.created_at DESC';
  if (sort === 'highest') orderBy = 'r.rating DESC, r.created_at DESC';
  if (sort === 'lowest') orderBy = 'r.rating ASC, r.created_at DESC';
  try {
    const [reviews] = await pool.query(`
      SELECT r.id, r.product_id, r.user_id, r.user_name, r.rating, r.comment,
             r.image_url, r.is_verified_purchase, r.status, r.created_at
      FROM reviews r
      WHERE r.product_id = ? AND r.status = 'approved'
      ORDER BY ${orderBy} LIMIT ? OFFSET ?
    `, [productId, limit, offset]);

    // Parse image_url as JSON array if stored as JSON
    const parsed = reviews.map(rv => {
      let images = [];
      if (rv.image_url) {
        try { images = JSON.parse(rv.image_url); }
        catch { images = [rv.image_url]; }
      }
      return { ...rv, images };
    });

    const [stats] = await pool.query(`SELECT rating, COUNT(*) AS count FROM reviews
      WHERE product_id = ? AND status = 'approved' GROUP BY rating`, [productId]);
    const dist = { 5:0,4:0,3:0,2:0,1:0 };
    let totalReviews = 0, totalScore = 0;
    stats.forEach(row => { const star = Number(row.rating), count = Number(row.count); dist[star] = count; totalReviews += count; totalScore += star * count; });
    return res.json({
      reviews: parsed,
      summary: {
        total_reviews: totalReviews,
        average_rating: totalReviews > 0 ? +(totalScore/totalReviews).toFixed(1) : 0,
        distribution: dist
      },
      has_more: offset + parsed.length < totalReviews,
    });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

// POST /api/reviews  (frontend calls this with JWT + multipart)
router.get('/reviews/eligibility/:productId', requireUser, async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId < 1) {
    return res.status(400).json({ error: 'Mã sản phẩm không hợp lệ.' });
  }
  try {
    const pool = db.promise();
    const [[purchase]] = await pool.query(
      `SELECT EXISTS(
         SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
       ) AS has_delivered_purchase`, [req.user.id, productId]);
    const [[review]] = await pool.query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ? LIMIT 1', [productId, req.user.id]);
    return res.json({
      can_review: Boolean(purchase.has_delivered_purchase) && !review,
      already_reviewed: Boolean(review),
      verified_purchase: Boolean(purchase.has_delivered_purchase),
    });
  } catch (error) {
    console.error('Review eligibility lookup failed:', error);
    return res.status(500).json({ error: 'Không thể kiểm tra điều kiện đánh giá.' });
  }
});

router.post('/reviews', requireUser, upload.array('images', 5), async (req, res) => {
  const pool = db.promise();
  const { product_id, rating, comment } = req.body;
  const productId = Number(product_id);
  const star = Number(rating);
  const cleanComment = typeof comment === 'string' ? comment.trim() : '';
  if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(star) || star < 1 || star > 5)
    return res.status(400).json({ error: 'Xếp hạng phải từ 1-5 sao' });
  if (cleanComment.length < 5 || cleanComment.length > 3000)
    return res.status(400).json({ error: 'Nội dung đánh giá phải dài từ 5 đến 3000 ký tự.' });
  if ((req.files || []).length > 5) return res.status(400).json({ error: 'Tối đa 5 ảnh cho mỗi đánh giá.' });
  const userId = req.user.id;
  const userName = req.user.name || req.user.email;

  // Save image URLs as JSON array
  const imageUrls = (req.files || []).map(f => `/images/reviews/${f.filename}`);
  const imageUrlJson = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;

  try {
    const [product] = await pool.query('SELECT id FROM products WHERE id = ? AND is_active = 1', [productId]);
    if (!product.length) return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    const [existing] = await pool.query('SELECT id FROM reviews WHERE product_id = ? AND user_id = ? LIMIT 1', [productId, userId]);
    if (existing.length) return res.status(409).json({ error: 'Bạn đã đánh giá sản phẩm này.' });
    const [orders] = await pool.query(
      `SELECT o.id FROM orders o JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'delivered' LIMIT 1`, [productId, userId]);
    const isVerified = orders.length > 0;
    if (!isVerified) return res.status(403).json({ error: 'Chỉ tài khoản đã nhận sản phẩm này mới có thể gửi đánh giá.' });
    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, user_id, user_name, user_email, rating, comment, image_url, is_verified_purchase, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [productId, userId, userName, req.user.email, star, cleanComment, imageUrlJson, isVerified]
    );
    await updateProductRatingStats(pool, productId);
    return res.status(201).json({ success: true, review_id: result.insertId, is_verified_purchase: isVerified });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Bạn đã đánh giá sản phẩm này.' });
    return res.status(500).json({ error: e.message });
  }
});

// GET /api/reviews/admin/all
router.get('/reviews/admin/all', async (req, res) => {
  const pool = db.promise();
  const { status } = req.query;
  const allowedStatuses = new Set(['all', 'pending', 'approved', 'hidden']);
  if (status && !allowedStatuses.has(status)) return res.status(400).json({ error: 'Trạng thái đánh giá không hợp lệ.' });
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  let sql = `SELECT r.*, p.name AS product_name FROM reviews r
             LEFT JOIN products p ON r.product_id = p.id WHERE 1=1`;
  const params = [];
  let countSql = 'SELECT COUNT(*) AS total FROM reviews WHERE 1=1';
  const countParams = [];
  if (status && status !== 'all') {
    sql += ' AND r.status = ?'; params.push(status);
    countSql += ' AND status = ?'; countParams.push(status);
  }
  sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?'; params.push(limit, offset);
  try {
    const [[count]] = await pool.query(countSql, countParams);
    const [reviews] = await pool.query(sql, params);
    const parsed = reviews.map(rv => {
      let images = [];
      if (rv.image_url) { try { images = JSON.parse(rv.image_url); } catch { images = [rv.image_url]; } }
      return { ...rv, images };
    });
    return res.json({ reviews: parsed, total: Number(count.total || 0), page, limit });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

// PATCH /api/reviews/:id/approve
router.patch('/reviews/:id/approve', async (req, res) => {
  const pool = db.promise();
  try {
    const [rv] = await pool.query('SELECT product_id FROM reviews WHERE id=?', [req.params.id]);
    if (!rv.length) return res.status(404).json({ error: 'Not found' });
    await pool.query("UPDATE reviews SET status='approved' WHERE id=?", [req.params.id]);
    await updateProductRatingStats(pool, rv[0].product_id);
    return res.json({ success: true });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

// PATCH /api/reviews/:id/hide
router.patch('/reviews/:id/hide', async (req, res) => {
  const pool = db.promise();
  try {
    const [rv] = await pool.query('SELECT product_id FROM reviews WHERE id=?', [req.params.id]);
    if (!rv.length) return res.status(404).json({ error: 'Not found' });
    await pool.query("UPDATE reviews SET status='hidden' WHERE id=?", [req.params.id]);
    await updateProductRatingStats(pool, rv[0].product_id);
    return res.json({ success: true });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

// DELETE /api/reviews/:id
router.delete('/reviews/:id', async (req, res) => {
  const pool = db.promise();
  try {
    const [rv] = await pool.query('SELECT product_id FROM reviews WHERE id=?', [req.params.id]);
    if (!rv.length) return res.status(404).json({ error: 'Not found' });
    await pool.query('DELETE FROM reviews WHERE id=?', [req.params.id]);
    await updateProductRatingStats(pool, rv[0].product_id);
    return res.json({ success: true });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

module.exports = router;
