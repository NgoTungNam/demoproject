require('dotenv').config();
const mysql = require('mysql2');

// Hỗ trợ cả biến kết nối riêng lẻ và connection string (Railway, TiDB, Render, PlanetScale, etc.)
const connectionConfig = process.env.DATABASE_URL || process.env.MYSQL_URL
    ? (process.env.DATABASE_URL || process.env.MYSQL_URL)
    : {
        host: process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost',
        user: process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
        password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || ''),
        database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'euroasia_db',
        port: Number(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306),
        timezone: 'Z',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: (process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true')
            ? { rejectUnauthorized: false }
            : undefined,
    };

const pool = mysql.createPool(connectionConfig);

// Keep DATETIME values, SQL NOW(), and mysql2 Date conversion in UTC consistently.
pool.on('connection', (connection) => {
    connection.query("SET time_zone = '+00:00'");
});

const isCloud = Boolean(process.env.MYSQLHOST || process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.RAILWAY_ENVIRONMENT || process.env.RENDER);
console.log(`🚀 Đã khởi tạo MySQL Connection Pool (${isCloud ? 'Cloud' : 'local'})!`);

module.exports = pool;

