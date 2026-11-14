require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'euroasia_db',
    port: process.env.DB_PORT || 3306,
    timezone: 'Z',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Keep DATETIME values, SQL NOW(), and mysql2 Date conversion in UTC consistently.
pool.on('connection', (connection) => {
    connection.query("SET time_zone = '+00:00'");
});

console.log('🚀 Đã khởi tạo MySQL Connection Pool (local)!');

module.exports = pool;

