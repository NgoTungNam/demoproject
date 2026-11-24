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
  { id: 1, name: "Ngô Tùng Nam", email: "admin@gmail.com", phone: "0965214607", role: "admin", joinDate: "2024-01-15T08:00:00Z" },
  { id: 2, name: "Trần Minh Quân", email: "quan.tran@gmail.com", phone: "0912345678", role: "customer", joinDate: "2024-02-20T10:30:00Z" },
  { id: 3, name: "Lê Hoàng Yến", email: "hoangyen@gmail.com", phone: "0987654321", role: "customer", joinDate: "2024-03-05T14:15:00Z" },
  { id: 4, name: "Phạm Hải Đăng", email: "haidang.chef@gmail.com", phone: "0903112233", role: "customer", joinDate: "2024-03-12T09:45:00Z" }
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
    product_id: 1,
    product_name: "Dao Bếp Chef Cao Cấp",
    user_name: "Ngô Tùng Nam",
    rating: 5,
    comment: "Dao rất bén, cầm đầm tay và đường cắt sắc ngọt. Thái thịt bò hay gọt rau củ đều rất mượt!",
    status: "approved",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    images: []
  },
  {
    id: 2,
    product_id: 2,
    product_name: "Nồi Inox Cao Cấp 3 Đáy",
    user_name: "Trần Minh Quân",
    rating: 5,
    comment: "Nồi 3 đáy dày dặn, bắt từ cực tốt, nấu trên bếp từ sôi rất nhanh và đều. Đóng gói cẩn thận.",
    status: "approved",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    images: []
  },
  {
    id: 3,
    product_id: 7,
    product_name: "Chảo Chống Dính Đá Hoa Cương",
    user_name: "Lê Hoàng Yến",
    rating: 5,
    comment: "Chảo chống dính đá hoa cương này chiên trứng không cần nhiều dầu, không bị dính đáy chút nào. 5 sao!",
    status: "approved",
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    images: []
  },
  {
    id: 4,
    product_id: 8,
    product_name: "Thìa Inox 304 Bàn Ăn",
    user_name: "Phạm Hải Đăng",
    rating: 5,
    comment: "Thìa sáng bóng, inox 304 cầm rất chắc tay và an toàn. Rất đáng tiền!",
    status: "approved",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    images: []
  }
];
