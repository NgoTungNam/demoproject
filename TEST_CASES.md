# TÀI LIỆU TEST CASE HỆ THỐNG EUROASIA KITCHEN (E-COMMERCE)

> **Dự án**: Website Thương mại điện tử EuroAsia - Dụng Cụ Bếp Chất Lượng  
> **Phiên bản**: v1.0.0  
> **Người thực hiện**: Tester / QA Team  
> **Môi trường Test**:  
> - **Frontend**: `http://localhost:3000` (React + Vite + Bootstrap)  
> - **Backend API**: `http://localhost:8080/api` (Node.js Express + MySQL)  
> - **Trình duyệt**: Google Chrome, Mozilla Firefox, Microsoft Edge (Desktop & Mobile Responsive)  

---

## 📌 TÀI KHOẢN VÀ DỮ LIỆU TEST CHUẨN

| Vai trò | Email / Tên đăng nhập | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@euroasia.com` | `123456` | Toàn quyền quản trị Dashboard, Orders, Products, Customers |
| **Khách hàng** | `customer@gmail.com` | `123456` | Tài khoản người dùng bình thường |
| **Tài khoản test mới** | Tùy chọn khi test đăng ký | Tối thiểu 6 ký tự | Dùng để test Module Auth |

---

## MỤC LỤC CÁC MODULE KIỂM THỬ

1. [Module 1: Authentication & Authorization (Xác thực & Phân quyền)](#module-1-authentication--authorization)
2. [Module 2: Trang Chủ & Tìm kiếm & Danh mục (Home & Catalog)](#module-2-trang-chủ--tìm-kiếm--danh-mục)
3. [Module 3: Chi tiết sản phẩm (Product Detail)](#module-3-chi-tiết-sản-phẩm)
4. [Module 4: Giỏ hàng (Shopping Cart)](#module-4-giỏ-hàng)
5. [Module 5: Thanh toán & Đặt hàng (Checkout & Payments)](#module-5-thanh-toán--đặt-hàng)
6. [Module 6: Kết quả thanh toán & Đơn hàng (Payment Result & Success)](#module-6-kết-quả-thanh-toán--đơn-hàng)
7. [Module 7: Quản trị - Dashboard (Admin Dashboard)](#module-7-quản-trị---dashboard)
8. [Module 8: Quản trị - Quản lý Sản phẩm (Admin Products)](#module-8-quản-trị---quản-lý-sản-phẩm)
9. [Module 9: Quản trị - Quản lý Danh mục (Admin Categories)](#module-9-quản-trị---quản-lý-danh-mục)
10. [Module 10: Quản trị - Quản lý Đơn hàng (Admin Orders)](#module-10-quản-trị---quản-lý-đơn-hàng)
11. [Module 11: Quản trị - Quản lý Khách hàng (Admin Customers)](#module-11-quản-trị---quản-lý-khách-hàng)
12. [Module 12: Kiểm thử Phi chức năng (Responsive, Bảo mật, Performance)](#module-12-kiểm-thử-phi-chức-năng)

---

## MODULE 1: AUTHENTICATION & AUTHORIZATION

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_AUTH_01** | Đăng nhập thành công tài khoản Khách hàng | Đã có tài khoản trong DB | 1. Vào `/login`<br>2. Nhập email & password đúng<br>3. Bấm "Đăng nhập" | `customer@gmail.com`<br>`123456` | - Đăng nhập thành công<br>- Chuyển hướng về trang chủ<br>- Header hiển thị tên "Ngô Tùng Nam" | High | Pass |
| **TC_AUTH_02** | Đăng nhập thành công tài khoản Quản trị (Admin) | Đã có tài khoản admin | 1. Vào `/login`<br>2. Nhập thông tin Admin<br>3. Bấm "Đăng nhập" | `admin@euroasia.com`<br>`123456` | - Đăng nhập thành công<br>- Header có nút/menu truy cập trang Quản trị (`/admin`) | Critical | Pass |
| **TC_AUTH_03** | Đăng nhập thất bại do sai mật khẩu | Tài khoản đã tồn tại | 1. Vào `/login`<br>2. Nhập đúng email, sai mật khẩu<br>3. Bấm "Đăng nhập" | `admin@euroasia.com`<br>`wrong_pass` | - Hiển thị thông báo lỗi "Email hoặc mật khẩu sai"<br>- Không cho phép đăng nhập | High | Pass |
| **TC_AUTH_04** | Đăng nhập thất bại do email chưa đăng ký | Email chưa có trong hệ thống | 1. Vào `/login`<br>2. Nhập email lạ<br>3. Bấm "Đăng nhập" | `notfound@domain.com`<br>`123456` | - Hiển thị thông báo "Email hoặc mật khẩu sai" | Medium | Pass |
| **TC_AUTH_05** | Validate form đăng nhập để trống | Đang ở trang `/login` | 1. Để trống Email hoặc Password<br>2. Bấm "Đăng nhập" | Email: ` ` hoặc Mật khẩu: ` ` | Trình duyệt hoặc hệ thống hiển thị cảnh báo yêu cầu điền đầy đủ thông tin | Low | Pass |
| **TC_AUTH_06** | Đăng ký tài khoản mới thành công | Đang ở `/register` | 1. Điền họ tên, email mới, mật khẩu, nhập lại mật khẩu<br>2. Bấm "Đăng ký" | Name: `Nguyễn Văn Test`<br>Email: `testuser@gmail.com`<br>Pass: `123456` | Đăng ký thành công, tự động chuyển về trang đăng nhập hoặc tự đăng nhập | High | Pass |
| **TC_AUTH_07** | Đăng ký thất bại do xác nhận mật khẩu không khớp | Đang ở `/register` | 1. Điền form đăng ký với 2 mật khẩu khác nhau<br>2. Bấm "Đăng ký" | Pass: `123456`<br>Confirm: `654321` | Hiển thị thông báo lỗi "Mật khẩu xác nhận không khớp" | Medium | Pass |
| **TC_AUTH_08** | Phân quyền: Ngăn người dùng thường truy cập `/admin` | Chưa đăng nhập hoặc đăng nhập tài khoản Customer | 1. Truy cập trực tiếp link `http://localhost:3000/admin` | Tài khoản: `customer@gmail.com` | - Không cho vào trang Admin<br>- Chuyển hướng về `/login` hoặc báo lỗi "Không có quyền truy cập" | Critical | Pass |
| **TC_AUTH_09** | Đăng xuất tài khoản | Đang đăng nhập tài khoản | 1. Bấm vào menu cá nhân trên Header<br>2. Chọn "Đăng xuất" | — | - Xoá phiên đăng nhập (token/user trong localStorage)<br>- Header trở về trạng thái "Đăng nhập / Đăng ký" | High | Pass |

---

## MODULE 2: TRANG CHỦ & TÌM KIẾM & DANH MỤC

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_HOME_01** | Tải trang chủ và hiển thị đầy đủ banner, danh mục, sản phẩm nổi bật | Frontend & Backend đang chạy | 1. Truy cập URL `/` | — | - Trang tải nhanh (< 2s)<br>- Hiển thị banner, danh mục (Dụng cụ bếp, Nồi & Chảo...), các sản phẩm kèm giá VND | High | Pass |
| **TC_CAT_01** | Xem toàn bộ danh sách sản phẩm tại `/products` | Có sản phẩm trong DB | 1. Bấm menu "Sản phẩm" trên Navbar | — | Hiển thị đầy đủ danh sách 8 sản phẩm kèm hình ảnh, tên, giá bán và nút "Thêm vào giỏ" | High | Pass |
| **TC_CAT_02** | Lọc sản phẩm theo danh mục | Đang ở `/products` | 1. Chọn tab danh mục "Nồi & Chảo"<br>2. Quan sát danh sách | Category: "Nồi & Chảo" | Chỉ hiển thị các sản phẩm thuộc danh mục "Nồi & Chảo" (Nồi Inox Cao Cấp, Chảo Chống Dính...) | High | Pass |
| **TC_CAT_03** | Tìm kiếm sản phẩm theo từ khóa | Đang ở `/products` hoặc thanh Search trên Header | 1. Nhập từ khóa vào ô tìm kiếm<br>2. Bấm Enter hoặc icon kính lúp | Từ khóa: `Dao` | Danh sách hiển thị chính xác các sản phẩm có chữ "Dao" (VD: Dao Bếp Chef) | Medium | Pass |
| **TC_CAT_04** | Tìm kiếm sản phẩm không tồn tại | Đang ở `/products` | 1. Nhập từ khóa vô nghĩa vào ô tìm kiếm | Từ khóa: `xyzabc123` | Hiển thị thông báo "Không tìm thấy sản phẩm nào phù hợp" | Low | Pass |

---

## MODULE 3: CHI TIẾT SẢN PHẨM (PRODUCT DETAIL)

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_PROD_01** | Xem chi tiết sản phẩm hợp lệ | Sản phẩm có ID = 1 | 1. Click vào thẻ sản phẩm hoặc link `/products/1` | ID: 1 | Hiển thị đầy đủ: Ảnh lớn, Tên sản phẩm, Giá bán, Trạng thái còn hàng, Mô tả chi tiết | High | Pass |
| **TC_PROD_02** | Tăng/giảm số lượng sản phẩm trước khi thêm vào giỏ | Đang ở trang chi tiết | 1. Bấm nút `+` để tăng số lượng<br>2. Bấm nút `-` để giảm | Số lượng: 3 | Số lượng cập nhật đúng, không thể giảm nhỏ hơn 1 | Medium | Pass |
| **TC_PROD_03** | Thêm sản phẩm vào giỏ từ trang chi tiết | Đang ở trang chi tiết | 1. Chọn số lượng = 2<br>2. Bấm nút "Thêm vào giỏ hàng" | Số lượng = 2 | - Icon giỏ hàng trên header tăng số lượng tương ứng (+2)<br>- Có thông báo Toast/Alert thêm thành công | High | Pass |
| **TC_PROD_04** | Xem sản phẩm không tồn tại | ID không có trong DB | 1. Truy cập `/products/9999` | ID: 9999 | Hiển thị thông báo "Không tìm thấy sản phẩm" hoặc điều hướng an toàn | Low | Pass |

---

## MODULE 4: GIỎ HÀNG (SHOPPING CART)

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_CART_01** | Xem giỏ hàng khi chưa có sản phẩm | Giỏ hàng rỗng | 1. Truy cập `/cart` | — | Hiển thị thông báo "Giỏ hàng trống" và nút "Tiếp tục mua sắm" | Medium | Pass |
| **TC_CART_02** | Xem giỏ hàng khi đã có sản phẩm | Đã thêm ít nhất 1 sản phẩm | 1. Truy cập `/cart` | — | Hiển thị danh sách sản phẩm, hình ảnh, đơn giá, số lượng, thành tiền từng món và Tổng tiền tạm tính | High | Pass |
| **TC_CART_03** | Thay đổi số lượng sản phẩm trong giỏ | Đang ở `/cart` | 1. Bấm tăng `+` hoặc giảm `-`<br>2. Quan sát thành tiền và Tổng tiền | Sản phẩm đơn giá 320.000đ, tăng từ 1 -> 2 | Thành tiền món đổi thành 640.000đ, Tổng tiền đơn hàng tăng tương ứng | High | Pass |
| **TC_CART_04** | Xóa từng sản phẩm khỏi giỏ hàng | Có ít nhất 1 sản phẩm trong giỏ | 1. Bấm icon thùng rác / nút Xóa cạnh sản phẩm | — | Sản phẩm bị xoá khỏi giỏ, tổng tiền được tính lại chính xác | High | Pass |
| **TC_CART_05** | Lưu giỏ hàng khi tải lại trang (Persistence) | Đang có sản phẩm trong giỏ | 1. Thêm sản phẩm vào giỏ<br>2. Nhấn F5 tải lại trang hoặc tắt tab mở lại | — | Giỏ hàng vẫn giữ nguyên các mặt hàng và số lượng (nhờ `localStorage`) | Medium | Pass |
| **TC_CART_06** | Chuyển sang bước thanh toán | Giỏ hàng có sản phẩm | 1. Bấm nút "Tiến hành thanh toán" (Checkout) | — | Chuyển hướng thành công sang trang `/checkout` | Critical | Pass |

---

## MODULE 5: THANH TOÁN & ĐẶT HÀNG (CHECKOUT & PAYMENTS)

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_CHECK_01** | Validate thông tin giao hàng bắt buộc | Đang ở `/checkout` | 1. Để trống một trong các ô (Họ tên, SĐT, Địa chỉ, Thành phố)<br>2. Bấm "Đặt Hàng Ngay" | Bỏ trống SĐT hoặc Địa chỉ | Cảnh báo yêu cầu nhập đầy đủ thông tin giao hàng trước khi tiếp tục | High | Pass |
| **TC_CHECK_02** | Đặt hàng phương thức COD thành công | Điền đủ thông tin giao hàng | 1. Chọn phương thức "Thanh toán khi nhận hàng (COD)"<br>2. Bấm "Đặt Hàng Ngay" | SĐT: `0965214607`<br>Tên: `Ngô Tùng Nam`<br>Địa chỉ: `Hà Nội` | - Tạo đơn hàng trong DB với `payment_method = 'cod'`, `payment_status = 'pending_cod'`<br>- Giỏ hàng được làm trống<br>- Chuyển hướng sang `/checkout/success?method=cod&orderId=...` | Critical | Pass |
| **TC_CHECK_03** | Đặt hàng phương thức Chuyển khoản ngân hàng (Bank Transfer) | Điền đủ thông tin giao hàng | 1. Chọn phương thức "Chuyển khoản ngân hàng"<br>2. Bấm "Đặt Hàng Ngay" | Thông tin giao hàng chuẩn | - Tạo đơn hàng trong DB với `payment_method = 'bank'`<br>- Chuyển sang `/checkout/success?method=bank&orderId=...`<br>- Hiển thị số TK Vietcombank, Chủ TK, cú pháp chuyển khoản `DH<MãĐơn>` | Critical | Pass |
| **TC_CHECK_04** | Khởi tạo thanh toán MoMo Sandbox | Điền đủ thông tin giao hàng | 1. Chọn phương thức "Ví điện tử MoMo"<br>2. Bấm "Thanh Toán MoMo" | Giỏ hàng > 0đ | - Gọi API `POST /api/payment/momo/create`<br>- Sinh chữ ký HMAC-SHA256 thành công<br>- Redirect người dùng sang cổng thanh toán MoMo Sandbox test | Critical | Pass |
| **TC_CHECK_05** | Khởi tạo thanh toán VNPay Sandbox | Điền đủ thông tin giao hàng | 1. Chọn phương thức "Cổng VNPay"<br>2. Bấm "Thanh Toán VNPay" | Giỏ hàng > 0đ | - Gọi API `POST /api/payment/vnpay/create`<br>- Chuyển hướng thành công sang cổng thanh toán VNPay Sandbox (`sandbox.vnpayment.vn`) | Critical | Pass |
| **TC_CHECK_06** | Tính đúng tổng tiền đơn hàng | Giỏ hàng gồm nhiều món | 1. Kiểm tra bảng tóm tắt đơn hàng ở cột bên phải | 1 Nồi (450k) + 1 Dao (320k) | Tạm tính = 770.000 ₫, Phí ship = Miễn phí, Tổng cộng = 770.000 ₫ | High | Pass |

---

## MODULE 6: KẾT QUẢ THANH TOÁN (PAYMENT RESULT & SUCCESS)

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_RES_01** | Xử lý thanh toán MoMo thành công và cập nhật DB | Thanh toán thành công trên MoMo test | 1. MoMo điều hướng về `/checkout/payment-result?resultCode=0&orderId=...`<br>2. Quan sát giao diện và DB | `resultCode = 0` | - Hiển thị "Thanh Toán Thành Công!" kèm mã đơn<br>- Giỏ hàng được xóa<br>- DB tự động cập nhật `payment_status = 'paid'` qua endpoint `/api/orders/:id/pay-success` | Critical | Pass |
| **TC_RES_02** | Xử lý thanh toán MoMo thất bại / Hủy bỏ | Người dùng bấm hủy trên MoMo test | 1. Cổng MoMo trả về `resultCode != 0` | `resultCode = 49` (hoặc khác 0) | - Hiển thị "Thanh Toán Thất Bại"<br>- Có nút "Thử Lại Thanh Toán" hoặc "Quay Lại Giỏ Hàng" | High | Pass |
| **TC_RES_03** | Xử lý thanh toán VNPay thành công | Thanh toán thành công trên VNPay sandbox | 1. VNPay trả về kết quả `vnp_ResponseCode=00` | `vnp_ResponseCode = '00'` | - Hiển thị "Thanh Toán Thành Công!" màu xanh lá<br>- Đơn hàng được cập nhật `payment_status = 'paid'` | Critical | Pass |
| **TC_RES_04** | Tự động đếm ngược chuyển về Trang chủ | Đang ở trang thanh toán thành công | 1. Không click thao tác gì<br>2. Chờ 8 giây | — | Bộ đếm giảm dần từ 8s về 0s và tự động chuyển về trang chủ (`/`) | Low | Pass |

---

## MODULE 7: QUẢN TRỊ - DASHBOARD (ADMIN DASHBOARD)

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_DASH_01** | Kiểm tra tính chính xác của Tổng Doanh Thu | Đăng nhập Admin, vào `/admin/dashboard` | 1. Xem thẻ "Tổng Doanh Thu"<br>2. So sánh với tổng tiền của 33 đơn hàng trong MySQL | DB orders: sum = 19.850.042 ₫ | Thẻ hiển thị chính xác **19.850.042 ₫** (KHÔNG hiển thị 0 đ) | Critical | Pass |
| **TC_DASH_02** | Kiểm tra số lượng Đơn Hàng | Đang ở `/admin/dashboard` | 1. Xem thẻ "Đơn Hàng"<br>2. Đếm số bản ghi trong bảng `orders` | DB count = 33 | Thẻ hiển thị đúng **33** đơn hàng | High | Pass |
| **TC_DASH_03** | Kiểm tra số lượng Sản Phẩm | Đang ở `/admin/dashboard` | 1. Xem thẻ "Sản Phẩm"<br>2. Đếm số bản ghi bảng `products` | DB products count = 8 | Thẻ hiển thị đúng **8** sản phẩm (KHÔNG hiển thị số ảo 45) | High | Pass |
| **TC_DASH_04** | Kiểm tra danh sách Sản phẩm bán chạy (Top Products) | Đang ở `/admin/dashboard` | 1. Quan sát khối "Sản phẩm bán chạy"<br>2. Đối chiếu bảng `order_items` | DB: Nồi Inox (33), Dao Bếp (5), Thìa (4), Chảo (1) | Hiển thị đúng các sản phẩm dụng cụ bếp đã bán và tỷ lệ thanh phần trăm tương ứng | High | Pass |
| **TC_DASH_05** | Kiểm tra Đơn hàng gần đây | Đang ở `/admin/dashboard` | 1. Xem bảng "Đơn hàng gần đây" (5 đơn mới nhất) | Đơn gần nhất #55, #54... | Hiển thị đúng Mã đơn, Khách hàng (Ngô Tùng Nam), Ngày đặt, Tổng tiền và Trạng thái | High | Pass |
| **TC_DASH_06** | Nút "Xem tất cả" chuyển hướng đến Quản lý Đơn hàng | Đang ở `/admin/dashboard` | 1. Bấm nút "Xem tất cả" tại bảng đơn hàng | — | Chuyển hướng chính xác đến URL `/admin/orders` | Low | Pass |

---

## MODULE 8: QUẢN TRỊ - QUẢN LÝ SẢN PHẨM (ADMIN PRODUCTS)

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_APROD_01** | Xem danh sách sản phẩm quản trị | Đăng nhập Admin | 1. Vào `/admin/products` | — | Hiển thị đầy đủ danh sách sản phẩm gồm: Hình ảnh, Tên, Danh mục, Giá, Tồn kho, Nút Thao tác | High | Pass |
| **TC_APROD_02** | Thêm mới sản phẩm thành công | Đang ở `/admin/products` | 1. Bấm nút "Thêm sản phẩm mới"<br>2. Điền tên, giá, chọn danh mục, mô tả, upload ảnh<br>3. Bấm "Lưu" | Tên: `Kéo Bếp Đa Năng`<br>Giá: `150000`<br>Danh mục: Dụng cụ bếp | Sản phẩm mới được tạo trong DB, xuất hiện ngay trên danh sách sản phẩm | Critical | Pass |
| **TC_APROD_03** | Chỉnh sửa thông tin sản phẩm | Đang ở `/admin/products` | 1. Bấm icon Chỉnh sửa tại 1 sản phẩm<br>2. Sửa giá hoặc số lượng tồn kho<br>3. Bấm Lưu | Sửa giá thành `350000` | Thông tin cập nhật thành công, hiển thị giá mới | High | Pass |
| **TC_APROD_04** | Xóa sản phẩm | Đang ở `/admin/products` | 1. Bấm nút Xóa tại sản phẩm muốn xóa<br>2. Xác nhận hộp thoại "Bạn có chắc chắn..." | Sản phẩm cần xóa | Sản phẩm bị gỡ khỏi danh sách và DB cập nhật | High | Pass |

---

## MODULE 9: QUẢN TRỊ - QUẢN LÝ DANH MỤC (ADMIN CATEGORIES)

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_ACAT_01** | Hiển thị danh mục thực tế từ Database | Đăng nhập Admin | 1. Vào `/admin/categories` | — | Hiển thị đúng các danh mục thực: "Dụng cụ bếp", "Nồi & Chảo" (KHÔNG hiển thị mock tiếng Anh) | High | Pass |
| **TC_ACAT_02** | Thêm danh mục mới | Đang ở `/admin/categories` | 1. Bấm "Thêm danh mục"<br>2. Nhập Tên danh mục & Mô tả<br>3. Bấm Lưu | Tên: `Thiết Bị Điện Bếp`<br>Mô tả: `Nồi chiên, lò nướng` | Danh mục mới được lưu vào DB và hiển thị trên bảng | High | Pass |
| **TC_ACAT_03** | Sửa danh mục | Đang ở `/admin/categories` | 1. Bấm nút Sửa danh mục<br>2. Đổi mô tả danh mục<br>3. Bấm Lưu | Đổi mô tả | Mô tả danh mục được cập nhật thành công | Medium | Pass |

---

## MODULE 10: QUẢN TRỊ - QUẢN LÝ ĐƠN HÀNG (ADMIN ORDERS)

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_AORD_01** | Xem danh sách tất cả 33 đơn hàng thực tế | Đăng nhập Admin | 1. Vào `/admin/orders` | — | - Hiển thị đủ 33 đơn hàng thực tế<br>- Hiển thị đúng tổng doanh thu: 19.850.042 ₫ | Critical | Pass |
| **TC_AORD_02** | Tìm kiếm đơn hàng theo mã đơn hoặc tên khách | Đang ở `/admin/orders` | 1. Nhập mã đơn hoặc tên khách vào ô Search | Từ khóa: `55` hoặc `Ngô Tùng Nam` | Bảng lọc đúng đơn hàng #55 của Ngô Tùng Nam | High | Pass |
| **TC_AORD_03** | Lọc đơn hàng theo phương thức thanh toán | Đang ở `/admin/orders` | 1. Chọn dropdown lọc "Phương thức: COD" | Lọc: `COD` | Bảng chỉ hiển thị các đơn thanh toán bằng COD | Medium | Pass |
| **TC_AORD_04** | Cập nhật trạng thái đơn hàng (Status Transition) | Đang ở `/admin/orders` | 1. Tại 1 đơn hàng trạng thái "Chờ xử lý"<br>2. Đổi dropdown trạng thái sang "Đang xử lý" / "Đã giao" | Đơn #55 đổi sang `delivered` | - Trạng thái cập nhật tức thì trên giao diện<br>- DB lưu trạng thái mới, không bị mất khi F5 | High | Pass |

---

## MODULE 11: QUẢN TRỊ - QUẢN LÝ KHÁCH HÀNG (ADMIN CUSTOMERS)

| Test Case ID | Mục tiêu kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu test | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_ACUST_01** | Xem danh sách khách hàng thực tế | Đăng nhập Admin | 1. Vào `/admin/customers` | — | Hiển thị danh sách khách hàng thật từ DB (Quản Trị Viên, Ngô Tùng Nam, khách A) kèm SĐT và email | High | Pass |
| **TC_ACUST_02** | Chỉnh sửa vai trò / thông tin khách hàng | Đang ở `/admin/customers` | 1. Bấm nút Sửa tại 1 người dùng<br>2. Đổi họ tên hoặc vai trò (Admin <-> Customer)<br>3. Bấm "Lưu Thay Đổi" | Role: `admin` | Thông tin được lưu vào DB, badge vai trò cập nhật tương ứng | High | Pass |
| **TC_ACUST_03** | Xóa khách hàng | Đang ở `/admin/customers` | 1. Bấm nút Xóa tại một khách hàng<br>2. Đồng ý popup xác nhận | Khách hàng cần xóa | Người dùng bị xóa khỏi hệ thống | Medium | Pass |

---

## MODULE 12: KIỂM THỬ PHI CHỨC NĂNG (NON-FUNCTIONAL TESTING)

| Test Case ID | Mục tiêu kiểm thử | Thiết bị / Môi trường | Các bước thực hiện | Kết quả mong đợi | Mức độ | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_NON_01** | Responsive trên Mobile (375px - iPhone X/12/14) | Chrome DevTools (375x812) | 1. Mở trang chủ, giỏ hàng, checkout và admin trên khung mobile | Giao diện tự động co giãn, chữ và nút không tràn màn hình, menu hamburger hoạt động tốt | High | Pass |
| **TC_NON_02** | Responsive trên Tablet (768px - iPad) | Chrome DevTools (768x1024) | 1. Mở các trang danh mục và quản trị trên tablet | Bảng dữ liệu hỗ trợ cuộn ngang (`table-responsive`), layout chia cột hợp lý | Medium | Pass |
| **TC_NON_03** | Bảo mật API (Bảo vệ dữ liệu người dùng) | Postman / Fetch | 1. Gọi thử API cập nhật đơn hàng với status không hợp lệ | Trả về HTTP `400 Bad Request` "Trạng thái không hợp lệ", không gây crash server | High | Pass |
| **TC_NON_04** | Hiệu năng tải trang (Performance) | Mạng nội bộ / Localhost | 1. Kiểm tra tốc độ load của API `/dashboard/stats` và trang chủ | Thời gian phản hồi < 500ms, không có memory leak hoặc connection timeout | Medium | Pass |

---

## HƯỚNG DẪN THỰC HIỆN TEST (DÀNH CHO TESTER)

1. **Khởi động môi trường trước khi test**:
   ```bash
   # Terminal 1: Chạy Backend Server
   npm run server
   # Server lắng nghe tại http://localhost:8080

   # Terminal 2: Chạy Frontend Vite
   npm run dev
   # Ứng dụng chạy tại http://localhost:3000
   ```
2. **Quy trình ghi nhận lỗi (Bug Report)**:
   - Khi phát hiện test case Fail, ghi chú lại:
     - **Mã Test Case** (VD: `TC_CHECK_04`)
     - **Mô tả lỗi**: Điều gì xảy ra khác với kết quả mong đợi?
     - **Các bước tái hiện (Steps to Reproduce)**
     - **Ảnh chụp màn hình (Screenshot) & Console log (F12)**
     - **Mức độ nghiêm trọng (Severity)**: Critical / High / Medium / Low
