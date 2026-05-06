/**
 * Migration: Thêm cột payment vào bảng orders
 * Chạy: node server/migrate_payment.js
 */
const db = require('./db');

const migrations = [
    `ALTER TABLE orders 
     ADD COLUMN IF NOT EXISTS payment_method 
     ENUM('cod','momo','vnpay','bank') DEFAULT 'cod'`,

    `ALTER TABLE orders 
     ADD COLUMN IF NOT EXISTS payment_status 
     ENUM('pending','pending_cod','paid','failed','refunded') DEFAULT 'pending'`,

    `ALTER TABLE orders 
     ADD COLUMN IF NOT EXISTS payment_ref VARCHAR(255) NULL`,
];

console.log('🔄 Đang chạy migration thanh toán...');

let count = 0;
migrations.forEach((sql, i) => {
    db.query(sql, (err) => {
        if (err) {
            // MySQL 5.x không hỗ trợ ADD COLUMN IF NOT EXISTS → thử cách khác
            const fallback = sql.replace(' IF NOT EXISTS', '');
            db.query(fallback, (err2) => {
                if (err2 && !err2.message.includes('Duplicate column')) {
                    console.error(`❌ Migration ${i + 1} thất bại:`, err2.message);
                } else {
                    console.log(`✅ Migration ${i + 1} OK`);
                }
                count++;
                if (count === migrations.length) {
                    console.log('✅ Tất cả migrations hoàn tất!');
                    process.exit(0);
                }
            });
        } else {
            console.log(`✅ Migration ${i + 1} OK`);
            count++;
            if (count === migrations.length) {
                console.log('✅ Tất cả migrations hoàn tất!');
                process.exit(0);
            }
        }
    });
});
