const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'euroasia_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Thêm SSL nếu dùng Railway hoặc PlanetScale
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null
});

console.log('🚀 Đã khởi tạo MySQL Connection Pool cho môi trường Cloud!');

module.exports = pool;
