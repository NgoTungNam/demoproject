const db = require('./db');

const tables = ['users', 'categories', 'products', 'orders', 'order_items'];

console.log('--- KIỂM TRA TRẠNG THÁI DATABASE ---');

const checkTable = (tableName) => {
    return new Promise((resolve) => {
        db.query(`SELECT COUNT(*) as count FROM ${tableName}`, (err, results) => {
            if (err) {
                console.log(`❌ Bảng [${tableName}]: Chưa tồn tại hoặc lỗi (${err.code})`);
                resolve(null);
            } else {
                console.log(`✅ Bảng [${tableName}]: Đang hoạt động - Có ${results[0].count} bản ghi`);
                resolve(results[0].count);
            }
        });
    });
};

async function runCheck() {
    for (const table of tables) {
        await checkTable(table);
    }
    console.log('-----------------------------------');
    process.exit();
}

runCheck();
