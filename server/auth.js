const crypto = require('crypto');
const db = require('./db');

function secret() {
  const value = process.env.AUTH_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error('AUTH_TOKEN_SECRET must be set to at least 32 characters.');
  return value;
}

function issueToken(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: Number(userId), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function readToken(token) {
  const [payload, signature, extra] = String(token || '').split('.');
  if (!payload || !signature || extra) return null;
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest();
  let actual;
  try { actual = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!Number.isInteger(decoded.sub) || decoded.exp <= Date.now() / 1000) return null;
    return decoded;
  } catch { return null; }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  if (stored.startsWith('scrypt$')) {
    const [, saltHex, hashHex] = stored.split('$');
    if (!saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  }
  // Upgrade legacy demo/plaintext credentials to a salted hash on successful login.
  return password === stored;
}

async function authenticate(req, res, next, adminOnly = false) {
  const match = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '');
  let decoded;
  try { decoded = match && readToken(match[1]); }
  catch { return res.status(503).json({ error: 'Authentication is not configured on the server.' }); }
  if (!decoded) return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  try {
    const [users] = await db.promise().query('SELECT id, email, full_name, role FROM users WHERE id = ?', [decoded.sub]);
    const user = users[0];
    if (!user) return res.status(401).json({ error: 'Tài khoản không còn tồn tại.' });
    if (adminOnly && user.role !== 'admin') return res.status(403).json({ error: 'Bạn không có quyền quản trị.' });
    req.user = { id: user.id, email: user.email, name: user.full_name, role: user.role };
    next();
  } catch (error) { next(error); }
}

const requireUser = (req, res, next) => authenticate(req, res, next, false);
const requireAdmin = (req, res, next) => authenticate(req, res, next, true);

function optionalUser(req, res, next) {
  if (!req.get('authorization')) return next();
  return authenticate(req, res, next, false);
}

module.exports = { issueToken, readToken, hashPassword, verifyPassword, requireUser, requireAdmin, optionalUser };
