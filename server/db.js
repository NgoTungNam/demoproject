const mysql = require('mysql2');

// Tạo kết nối đến database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Tên đăng nhập mặc định của XAMPP/MySQL
    password: '123456', // Mật khẩu bạn vừa cung cấp
    database: 'euroasia_db' // Tên database bạn cần tạo trong MySQL
});

connection.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err);
        return;
    }
    console.log('Đã kết nối thành công với MySQL Database!');
});

module.exports = connection;
