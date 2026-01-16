# Database Schema Design for EuroAsia Project

Dựa trên cấu trúc frontend hiện tại, dưới đây là thiết kế database MySQL đề xuất.

## 1. Entity Relationship Diagram (ERD) Flow
`Users` --(1:n)--> `Orders` --(1:n)--> `Order_Items` --(n:1)--> `Products` --(n:1)--> `Categories`

## 2. SQL Schema

### Users Table
Lưu trữ thông tin người dùng và quản trị viên.
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Categories Table
Danh mục sản phẩm (Ví dụ: Nồi, Chảo, Dao...)
```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
Thông tin chi tiết sản phẩm.
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL, -- Giá tiền (VNĐ)
    stock INT DEFAULT 0,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### Orders Table
Lưu thông tin đơn hàng.
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    total_amount DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_name VARCHAR(100),
    shipping_address TEXT,
    shipping_phone VARCHAR(20),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Order Items Table
Lưu chi tiết sản phẩm trong từng đơn hàng. Bảng này quan trọng để lưu giá tại thời điểm mua (tránh việc giá sản phẩm thay đổi làm sai lệch lịch sử đơn hàng).
```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(255), -- Lưu tên tại thời điểm mua backup
    quantity INT NOT NULL,
    price DECIMAL(12, 2) NOT NULL, -- Giá tại thời điểm mua
    total_price DECIMAL(12, 2) NOT NULL, -- quantity * price
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);
```

### (Optional) Cart Table
Nếu muốn lưu giỏ hàng trên server (thay vì localStorage như hiện tại).
```sql
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
);
```

## 3. Sample Data Queries (Dữ liệu mẫu)

**Thêm Category mẫu:**
```sql
INSERT INTO categories (name, description) VALUES 
('Dụng cụ bếp', 'Các loại dao, kéo, thớt...'),
('Nồi & Chảo', 'Nồi inox, chảo chống dính...');
```

**Thêm Product mẫu:**
```sql
INSERT INTO products (category_id, name, price, stock, image_url) VALUES 
(1, 'Dao Bếp Chef', 320000, 50, '/images/products/dao.jpg'),
(2, 'Nồi Inox Cao Cấp', 450000, 20, '/images/products/noiinox.jpg');
```
