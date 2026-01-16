# EuroAsia Kitchen - Frontend Website

Frontend website bán hàng dụng cụ bếp EuroAsia được xây dựng bằng React.js, HTML, CSS, Bootstrap 5 và JavaScript để kết nối với Java Spring Boot backend.

## Tính Năng

- 🏠 **Trang Chủ**: Hiển thị sản phẩm nổi bật và danh mục
- 📦 **Danh Sách Sản Phẩm**: Xem tất cả sản phẩm với bộ lọc theo danh mục
- 🔍 **Tìm Kiếm**: Tìm kiếm sản phẩm theo từ khóa
- 🛒 **Giỏ Hàng**: Thêm, xóa, cập nhật số lượng sản phẩm
- 💳 **Thanh Toán**: Form đặt hàng với thông tin giao hàng
- 📱 **Responsive**: Giao diện đẹp trên mọi thiết bị

## Công Nghệ Sử Dụng

- **React.js 18**: Framework JavaScript
- **React Router DOM 6**: Điều hướng trang
- **Bootstrap 5**: Framework CSS
- **Axios**: HTTP client để gọi API
- **Vite**: Build tool và dev server

## Cài Đặt

### Yêu Cầu

- Node.js >= 16.0.0
- npm hoặc yarn

### Các Bước Cài Đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Chạy ứng dụng ở chế độ development:**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

3. **Build cho production:**
```bash
npm run build
```

## Cấu Hình Backend

Mặc định, ứng dụng kết nối với Spring Boot backend tại `http://localhost:8080/api`.

Để thay đổi URL backend, chỉnh sửa file `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url:port/api'
```

## Cấu Trúc API Backend Cần Thiết

Backend Spring Boot cần cung cấp các API endpoints sau:

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/{id}` - Lấy chi tiết sản phẩm
- `GET /api/products/category/{categoryId}` - Lấy sản phẩm theo danh mục
- `GET /api/products/search?q={keyword}` - Tìm kiếm sản phẩm

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/{id}` - Lấy chi tiết danh mục

### Cart (Optional - hiện tại dùng localStorage)
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/add` - Thêm vào giỏ hàng
- `PUT /api/cart/items/{itemId}` - Cập nhật giỏ hàng
- `DELETE /api/cart/items/{itemId}` - Xóa khỏi giỏ hàng

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/{id}` - Lấy chi tiết đơn hàng

### Authentication (Optional)
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Lấy thông tin user hiện tại

## Cấu Trúc Thư Mục

```
src/
├── components/          # Các component tái sử dụng
│   ├── Header.jsx      # Header với navigation
│   ├── Footer.jsx      # Footer
│   └── ProductCard.jsx # Card hiển thị sản phẩm
├── pages/              # Các trang chính
│   ├── Home.jsx        # Trang chủ
│   ├── Products.jsx    # Danh sách sản phẩm
│   ├── ProductDetail.jsx # Chi tiết sản phẩm
│   ├── Cart.jsx        # Giỏ hàng
│   └── Checkout.jsx    # Thanh toán
├── context/            # React Context
│   └── CartContext.jsx # Quản lý state giỏ hàng
├── services/           # API services
│   └── api.js         # Axios configuration và API calls
├── App.jsx            # Component chính
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Tính Năng Nổi Bật

- ✅ Responsive design với Bootstrap 5
- ✅ Quản lý giỏ hàng với localStorage
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Giao diện đẹp, hiện đại
- ✅ Tích hợp sẵn với Spring Boot backend
- ✅ Error handling và loading states
- ✅ Format giá tiền theo định dạng Việt Nam

## Lưu Ý

- Giỏ hàng hiện tại được lưu trong localStorage của trình duyệt
- Để tích hợp đầy đủ với backend, cần implement các API endpoints tương ứng
- CORS cần được cấu hình đúng ở Spring Boot backend để cho phép frontend gọi API

## Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ đội phát triển.

---

© 2024 EuroAsia Kitchen. All rights reserved.

# frontenddevproeducation
