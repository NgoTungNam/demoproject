require('dotenv').config();
const db = require('./db');
const { hashPassword } = require('./auth');

async function createAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || password.length < 12) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) before running npm run admin:create.');
  }
  const pool = db.promise();
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length) {
      await pool.query("UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?", [hashPassword(password), users[0].id]);
      console.log(`Admin access updated for ${email}.`);
    } else {
      const [result] = await pool.query("INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, 'Administrator', 'admin')", [email, hashPassword(password)]);
      console.log(`Admin account created for ${email} (id ${result.insertId}).`);
    }
  } finally { await pool.end(); }
}

createAdmin().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
