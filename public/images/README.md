# Thư Mục Hình Ảnh

Thư mục này chứa tất cả hình ảnh cho website EuroAsia.

## Cấu Trúc Thư Mục:

```
public/images/
├── products/          # Hình ảnh sản phẩm
├── banners/           # Hình ảnh banner/quảng cáo
└── categories/        # Hình ảnh danh mục sản phẩm
```

## Hình ảnh sản phẩm cần có:

Đặt các hình ảnh sản phẩm vào thư mục `products/`:

1. **bo-dao-bep-cao-cap.jpg** - Hình ảnh bộ dao bếp cao cấp Boker
   - Đường dẫn: `/images/products/bo-dao-bep-cao-cap.jpg` hoặc `/images/bo-dao-bep-cao-cap.jpg`
   - Giá: 2.500.000 VNĐ

2. **noi-inox.jpg** - Hình ảnh nồi hấp đa tầng inox 304 cao cấp
   - Đường dẫn: `/images/products/noi-inox.jpg` hoặc `/images/noi-inox.jpg`
   - Giá: 1.200.000 VNĐ

3. **chao-chong-dinh.jpg** - Hình ảnh chảo chống dính
   - Đường dẫn: `/images/products/chao-chong-dinh.jpg` hoặc `/images/chao-chong-dinh.jpg`

## Quy Ước Đặt Tên:

- Đặt tên file không có dấu và khoảng trắng
- Sử dụng dấu gạch ngang (-) để phân cách từ
- Ví dụ: `bo-dao-bep-cao-cap.jpg`, `noi-inox.jpg`

## Định Dạng & Kích Thước:

- **Định dạng**: JPG, PNG, WebP
- **Kích thước khuyến nghị**: 
  - Sản phẩm: 800x600px hoặc tỷ lệ 4:3
  - Banner: 1920x600px hoặc tỷ lệ 16:5
  - Danh mục: 400x300px
- **Tối ưu**: Nén hình ảnh trước khi upload để tăng tốc độ tải trang

## Cách Thêm Hình Ảnh:

1. Copy hình ảnh vào thư mục phù hợp:
   - Sản phẩm → `public/images/products/`
   - Banner → `public/images/banners/`
   - Danh mục → `public/images/categories/`

2. Đặt tên file theo quy ước trên

3. Hình ảnh sẽ tự động hiển thị trên website với đường dẫn `/images/[thư-mục]/[tên-file]`

## Lưu Ý:

- Tất cả hình ảnh trong thư mục `public/` có thể truy cập trực tiếp từ URL
- Với Vite, hình ảnh trong `public/images/` có thể truy cập qua `/images/[tên-file]`
- Đảm bảo kích thước file hợp lý để tối ưu hiệu suất website

