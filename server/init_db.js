const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// 1. Kết nối không cần DB trước để tạo DB
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    multipleStatements: true // Quan trọng để chạy chuỗi SQL dài
});

const schemaPath = path.join(__dirname, '..', 'database_schema.md');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Trích xuất các khối SQL từ file markdown
const sqlBlocks = schemaContent.match(/```sql([\s\S]*?)```/g) || [];
const fullSql = sqlBlocks.map(block => block.replace(/```sql|```/g, '')).join('\n');

console.log('--- ĐANG KHỞI TẠO DATABASE ---');

connection.connect((err) => {
    if (err) {
        console.error('❌ Lỗi kết nối MySQL:', err.message);
        process.exit(1);
    }

    connection.query('CREATE DATABASE IF NOT EXISTS euroasia_db', (err) => {
        if (err) {
            console.error('❌ Lỗi tạo Database:', err.message);
            process.exit(1);
        }
        console.log('✅ Đã tạo/Kiểm tra xong Database: euroasia_db');

        connection.changeUser({ database: 'euroasia_db' }, (err) => {
            if (err) {
                console.error('❌ Lỗi chọn Database:', err.message);
                process.exit(1);
            }

            connection.query(fullSql, (err) => {
                if (err) {
                    console.error('❌ Lỗi chạy Script SQL:', err.message);
                    // Không thoát để xem lỗi cụ thể, có thể do bảng đã tồn tại
                } else {
                    console.log('✅ Đã khởi tạo các bảng và dữ liệu mẫu thành công!');
                }
                connection.end();
                console.log('------------------------------');
            });
        });
    });
});
