# EuroAsia Kitchen - Fullstack Website (Node.js & MySQL)

Website bán hàng dụng cụ bếp EuroAsia là một ứng dụng Fullstack hoàn chỉnh, được xây dựng với công nghệ hiện đại, kết nối trực tiếp với cơ sở dữ liệu MySQL.

## 🚀 Tính Năng Chính

- 🏠 **Trang Chủ**: Giao diện hiện đại, hiển thị banner và các danh mục sản phẩm.
- 📦 **Quản Lý Sản Phẩm**: 
  - Xem danh sách sản phẩm với bộ lọc theo danh mục.
  - Xem chi tiết sản phẩm với hình ảnh sắc nét.
  - Admin có thể thêm mới sản phẩm và upload ảnh thật lên server.
- 🛒 **Giỏ Hàng**: Thêm, xóa, cập nhật số lượng sản phẩm.
- 💳 **Thanh Toán**: Đặt hàng và lưu thông tin đơn hàng vào Database MySQL.
- 🔐 **Hệ Thống Admin**: Trang quản trị dành riêng cho Admin để quản lý kho hàng và đơn hàng.
- 📱 **Responsive**: Hiển thị mượt mà trên cả máy tính và điện thoại.

## 🛠 Công Nghệ Sử Dụng

### Frontend
- **React.js 18** (Vite)
- **Bootstrap 5** & React-Bootstrap
- **React Router DOM 6** (Điều hướng)
- **Axios** (Kết nối API)

### Backend
- **Node.js** & **Express**
- **MySQL** (Cơ sở dữ liệu)
- **Multer** (Xử lý upload hình ảnh)
- **CORS** (Kết nối giữa các cổng)

## ⚙️ Cài Đặt & Khởi Chạy

### 1. Yêu Cầu Hệ Thống
- Đã cài đặt **Node.js** (v16 trở lên).
- Đã cài đặt **MySQL** (Khuyên dùng XAMPP).

### 2. Thiết Lập Database
1. Mở phpMyAdmin (thường là `http://localhost/phpmyadmin`).
2. Tạo một database mới tên là: `euroasia_db`.
3. Copy và chạy toàn bộ mã SQL trong file `database_schema.md` để tạo bảng và nạp dữ liệu mẫu.

### 3. Cài Đặt Mã Nguồn
```bash
# Cài đặt các thư viện cần thiết
npm install
```

### 4. Khởi Chạy Ứng Dụng

Mở 2 cửa sổ terminal (hoặc chạy lần lượt):

**Terminal 1: Chạy Backend Server**
```bash
npm run server
```
*Server sẽ chạy tại: http://localhost:8080*

**Terminal 2: Chạy Frontend Web**
```bash
npm run dev
```
*Giao diện web sẽ chạy tại: http://localhost:3000*

## 📁 Cấu Trúc Thư Mục

```
├── server/              # Backend Node.js
│   ├── db.js           # Kết nối MySQL
│   └── index.js        # Express API Routes
├── src/                # Frontend React
│   ├── components/     # Các thành phần giao diện (Header, Footer,...)
│   ├── pages/          # Các trang chính (Home, Admin, Products,...)
│   ├── services/       # axios API calls
│   └── context/        # Quản lý Giỏ hàng và Auth
├── public/             # Thư mục chứa ảnh tĩnh và ảnh upload
│   └── images/products # Nơi lưu ảnh sản phẩm khi Admin upload
└── database_schema.md  # Hướng dẫn tạo bảng MySQL
```

## 🔐 Tài Khoản Demo (Admin)
- **Email**: `admin@gmail.com`
- **Mật khẩu**: `123456`

---

© 2024 EuroAsia Kitchen. Phát triển bởi NgoTungNam.
