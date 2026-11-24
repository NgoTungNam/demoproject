export const DEFAULT_CATEGORIES = [
  { id: 1, name: "Dụng cụ bếp", description: "Các loại dao, kéo, thớt, muỗng thìa..." },
  { id: 2, name: "Nồi & Chảo", description: "Nồi inox, chảo chống dính, nồi hấp..." },
  { id: 3, name: "Thiết bị nhà bếp", description: "Nồi chiên không dầu, bếp từ, máy xay..." },
  { id: 4, name: "Phụ kiện bàn ăn", description: "Muỗng, đũa, khay, thớt cao cấp..." }
];

export const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Dao Bếp Chef Cao Cấp",
    category_id: 1,
    category_name: "Dụng cụ bếp",
    price: 320000,
    original_price: 400000,
    current_price: 320000,
    discount_percent: 20,
    stock: 49,
    rating_average: 5.0,
    review_count: 2,
    image_url: "/images/products/dao.jpg",
    is_active: 1,
    description: "Dao bếp Chef chuyên nghiệp bằng thép không gỉ cao cấp, độ sắc bén hoàn hảo, tay cầm công thái học chống trơn trượt."
  },
  {
    id: 2,
    name: "Nồi Inox Cao Cấp 3 Đáy",
    category_id: 2,
    category_name: "Nồi & Chảo",
    price: 450000,
    original_price: 600000,
    current_price: 450000,
    discount_percent: 25,
    stock: 20,
    rating_average: 5.0,
    review_count: 1,
    image_url: "/images/products/noiinox.jpg",
    is_active: 1,
    description: "Nồi inox 3 đáy cao cấp, truyền nhiệt đều, giữ nhiệt tốt, sử dụng được cho mọi loại bếp kể cả bếp từ."
  },
  {
    id: 7,
    name: "Chảo Chống Dính Đá Hoa Cương",
    category_id: 2,
    category_name: "Nồi & Chảo",
    price: 380000,
    original_price: 500000,
    current_price: 380000,
    discount_percent: 24,
    stock: 30,
    rating_average: 4.67,
    review_count: 3,
    image_url: "/images/products/chao.jpg",
    is_active: 1,
    description: "Chảo chống dính đá hoa cương siêu bền, phủ lớp chống dính Teflon an toàn không chứa PFOA, tiết kiệm dầu ăn."
  },
  {
    id: 8,
    name: "Thìa Inox 304 Bàn Ăn",
    category_id: 1,
    category_name: "Dụng cụ bếp",
    price: 45000,
    original_price: 60000,
    current_price: 45000,
    discount_percent: 25,
    stock: 84,
    rating_average: 4.8,
    review_count: 12,
    image_url: "/images/products/thia.jpg",
    is_active: 1,
    description: "Thìa ăn inox 304 sáng bóng, không hoen gỉ, dày dặn, sang trọng cho bàn ăn gia đình."
  },
  {
    id: 6,
    name: "Nồi Hấp Inox Đa Năng 2 Tầng",
    category_id: 2,
    category_name: "Nồi & Chảo",
    price: 1200000,
    original_price: 1500000,
    current_price: 1200000,
    discount_percent: 20,
    stock: 15,
    rating_average: 4.9,
    review_count: 5,
    image_url: "/images/products/noiinox.jpg",
    is_active: 1,
    description: "Nồi hấp đa tầng bằng inox 304 cao cấp, thiết kế nhiều tầng tiện lợi, tay cầm chắc chắn, an toàn sức khỏe."
  },
  {
    id: 4,
    name: "Chảo Xào Lòng Sâu Cao Cấp",
    category_id: 2,
    category_name: "Nồi & Chảo",
    price: 520000,
    original_price: 650000,
    current_price: 520000,
    discount_percent: 20,
    stock: 25,
    rating_average: 4.5,
    review_count: 4,
    image_url: "/images/products/chao.jpg",
    is_active: 1,
    description: "Chảo xào lòng sâu tiện lợi cho các món chiên ngập dầu và xào nấu, nắp kính cường lực chịu nhiệt."
  },
  {
    id: 5,
    name: "Bộ Thìa Muỗng Nhà Bếp Tiện Lợi",
    category_id: 1,
    category_name: "Dụng cụ bếp",
    price: 180000,
    original_price: 220000,
    current_price: 180000,
    discount_percent: 18,
    stock: 40,
    rating_average: 4.7,
    review_count: 6,
    image_url: "/images/products/thia.jpg",
    is_active: 1,
    description: "Bộ muôi thìa nhà bếp tiện lợi, chất liệu inox 304 sáng bóng, chống gỉ sét, dễ dàng vệ sinh."
  },
  {
    id: 9,
    name: "Nồi Chiên Không Dầu",
    category_id: 3,
    category_name: "Thiết bị nhà bếp",
    price: 3000000,
    original_price: 4000000,
    current_price: 3000000,
    discount_percent: 25,
    stock: 100,
    rating_average: 5.0,
    review_count: 1,
    image_url: "/images/products/noichien.jpg",
    is_active: 1,
    description: "Nồi chiên không dầu cao cấp công nghệ châu âu"
  },
  {
    id: 10,
    name: "Máy Ép Chậm Hoa Quả EuroAsia",
    category_id: 3,
    category_name: "Thiết bị nhà bếp",
    price: 1850000,
    original_price: 2450000,
    current_price: 1850000,
    discount_percent: 24,
    stock: 50,
    rating_average: 5.0,
    review_count: 8,
    image_url: "/images/products/mayep.webp",
    is_active: 1,
    description: "Máy ép chậm trái cây hoa quả giữ trọn dưỡng chất, ép kiệt bã, công nghệ trục vít xoắn ốc hiện đại, vận hành êm ái."
  }
];

export const DEFAULT_CUSTOMERS = [
  { id: 1, name: "Quản Trị Viên", email: "admin@euroasia.com", phone: "0901234567", role: "admin", joinDate: "2026-10-13T09:51:03Z" },
  { id: 2, name: "Ngô Tùng Nam", email: "customer@gmail.com", phone: "0965214607", role: "customer", joinDate: "2026-10-13T09:51:03Z" },
  { id: 9, name: "Administrator", email: "admin@gmail.com", phone: "0965214607", role: "admin", joinDate: "2026-10-24T00:58:46Z" },
  { id: 15, name: "nam", email: "ntn@gmail.com", phone: "0987654321", role: "customer", joinDate: "2026-10-24T03:02:33Z" },
  { id: 17, name: "Ngô Tùng Nam", email: "user@gmail.com", phone: "0903112233", role: "customer", joinDate: "2026-11-13T00:28:48Z" }
];

export const DEFAULT_FLASH_SALES = [
  {
    id: 1,
    name: "Giờ Vàng Bếp Xinh - Ưu Đãi 25%",
    start_time: new Date(Date.now() - 3600000 * 2).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 3).toISOString(),
    is_active: 1,
    items: [
      { product_id: 1, product_name: "Dao Bếp Chef Cao Cấp", flash_price: 256000, original_price: 320000, quantity: 20 },
      { product_id: 7, product_name: "Chảo Chống Dính Đá Hoa Cương", flash_price: 299000, original_price: 380000, quantity: 15 }
    ]
  }
];

export const DEFAULT_REVIEWS = [
  {
    id: 1,
    product_id: 7,
    product_name: "Chảo Chống Dính",
    user_name: "Nguyễn Văn Hùng",
    rating: 5,
    comment: "Chảo dùng rất thích, lòng chảo chống dính mịn màng, chiên cá không bị dính một chút nào. Tay cầm chắc chắn cách nhiệt tốt.",
    status: "approved",
    created_at: "2026-10-23T16:56:53.000Z",
    images: ["/images/products/chao.jpg"]
  },
  {
    id: 2,
    product_id: 7,
    product_name: "Chảo Chống Dính",
    user_name: "Trần Thị Mai",
    rating: 5,
    comment: "Sản phẩm giao hàng nhanh đóng gói cẩn thận. Đã test chiên trứng và làm bò bít tết cực ngon!",
    status: "approved",
    created_at: "2026-10-23T16:56:53.000Z",
    images: []
  },
  {
    id: 3,
    product_id: 7,
    product_name: "Chảo Chống Dính",
    user_name: "Lê Hoàng Nam",
    rating: 4,
    comment: "Chảo đẹp, cầm vừa tay, đáy từ bắt nhiệt nhanh trên bếp từ Bosch.",
    status: "approved",
    created_at: "2026-10-23T16:56:53.000Z",
    images: []
  },
  {
    id: 4,
    product_id: 1,
    product_name: "Dao Bếp Chef",
    user_name: "Phạm Quốc Bảo",
    rating: 5,
    comment: "Dao sắc bén tuyệt vời, cắt thịt bò ngọt lịm. Thép dày dặn, đầm tay.",
    status: "approved",
    created_at: "2026-10-23T16:56:53.000Z",
    images: ["/images/products/dao.jpg"]
  },
  {
    id: 5,
    product_id: 1,
    product_name: "Dao Bếp Chef",
    user_name: "Hoàng Thu Trang",
    rating: 5,
    comment: "Đầu bếp gia đình rất ưng ý con dao này, gọt tỉa hay thái lát mỏng đều chuẩn.",
    status: "approved",
    created_at: "2026-10-23T16:56:53.000Z",
    images: []
  },
  {
    id: 6,
    product_id: 2,
    product_name: "Nồi Inox Cao Cấp",
    user_name: "Đỗ Minh Tuấn",
    rating: 5,
    comment: "Nồi inox 304 sáng bóng, thành nồi dày giữ nhiệt rất tốt. Luộc gà nấu canh gia đình 4-5 người thoải mái.",
    status: "approved",
    created_at: "2026-10-23T16:56:53.000Z",
    images: ["/images/products/noiinox.jpg"]
  }
];
