import { DEFAULT_PRODUCTS } from '../data/mockProducts.js';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
}

const maxPatterns = [
  /(?:dưới|nhỏ hơn|<|tối đa|tầm|khoảng|đổ lại|không quá)\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|tr|triệu|củ|vnd|đ|đồng)?/i,
  /(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|tr|triệu|củ|đ|đồng)\s*(?:đổ lại|trở xuống|quay đầu)/i,
  /(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|tr|triệu|củ)/i,
];

function extractBudget(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const p of maxPatterns) {
    const m = lower.match(p);
    if (m) {
      let num = parseFloat(m[1].replace(',', '.'));
      const unit = (m[2] || '').toLowerCase();
      if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') num *= 1000;
      else if (unit === 'tr' || unit === 'triệu' || unit === 'củ') num *= 1000000;
      else if (num < 1000) num *= 1000;
      return num;
    }
  }
  return null;
}

export function getClientChatResponse(message) {
  const text = (message || '').toLowerCase().trim();
  const budget = extractBudget(text);

  let matched = [];
  let reply = '';

  const isKnife = text.includes('dao') || text.includes('thái') || text.includes('gọt') || text.includes('chặt') || text.includes('chef');
  const isPan = text.includes('chảo') || text.includes('chiên') || text.includes('xào') || text.includes('chống dính');
  const isPot = text.includes('nồi') || text.includes('hấp') || text.includes('kho') || text.includes('luộc') || text.includes('canh');
  const isSpoon = text.includes('thìa') || text.includes('muỗng') || text.includes('bàn ăn') || text.includes('dĩa') || text.includes('đũa');

  // --- TRƯỜNG HỢP 1: NGƯỜI DÙNG HỎI THEO NGÂN SÁCH (CÓ KÈM HOẶC KHÔNG KÈM LOẠI ĐỒ) ---
  if (budget !== null) {
    // 1.1 Ngân sách + Chảo
    if (isPan) {
      matched = DEFAULT_PRODUCTS.filter(p => (p.id === 7 || p.id === 4) && (p.current_price ?? p.price) <= budget);
      if (matched.length > 0) {
        reply = `Dạ với ngân sách dưới ${formatVND(budget)} cho chảo bếp, em xin gợi ý mẫu chảo tối ưu nhất cho gia đình:\n\n` +
          `• **Chảo Chống Dính Đá Hoa Cương** (380.000đ): Chống dính đá khoáng 5 lớp không chứa PFOA, tiết kiệm 70% dầu ăn và bắt từ cực tốt.`;
      } else {
        matched = [DEFAULT_PRODUCTS.find(p => p.id === 7)];
        reply = `Dạ hiện tại mẫu chảo chất lượng có mức giá tốt nhất của EuroAsia là **Chảo Chống Dính Đá Hoa Cương** giá **380.000đ** (đang giảm 24% từ 500.000đ). Với mức ngân sách ${formatVND(budget)}, anh/chị cân nhắc thêm một chút để sở hữu chiếc chảo chuẩn xịn này nhé:`;
      }
    }
    // 1.2 Ngân sách + Nồi
    else if (isPot) {
      matched = DEFAULT_PRODUCTS.filter(p => (p.id === 2 || p.id === 6) && (p.current_price ?? p.price) <= budget);
      if (matched.length > 0) {
        reply = `Dạ với ngân sách dưới ${formatVND(budget)} cho nồi nấu, em xin giới thiệu mẫu nồi inox 3 đáy chuẩn Châu Âu:\n\n` +
          `• Đáy 3 lớp truyền nhiệt đều, không bị cháy khét cục bộ, sử dụng hoàn hảo trên bếp từ, bếp gas và hồng ngoại.`;
      } else {
        matched = [DEFAULT_PRODUCTS.find(p => p.id === 2)];
        reply = `Dạ mẫu nồi inox 3 đáy cao cấp nhất trong phân khúc tiết kiệm của EuroAsia là **Nồi Inox Cao Cấp 3 Đáy** giá **450.000đ** (giá gốc 600.000đ). Anh/chị xem chi tiết bên dưới nhé:`;
      }
    }
    // 1.3 Ngân sách + Dao
    else if (isKnife) {
      matched = DEFAULT_PRODUCTS.filter(p => p.id === 1 && (p.current_price ?? p.price) <= budget);
      if (matched.length > 0) {
        reply = `Dạ mẫu **Dao Bếp Chef Cao Cấp** hiện đang có giá ưu đãi **320.000đ** (giá gốc 400.000đ), hoàn toàn nằm trong ngân sách ${formatVND(budget)} của anh/chị:\n\n` +
          `• Lưỡi thép không gỉ tôi nhiệt cao tần sắc bén, giữ cạnh sắc lâu và đầm tay khi thái gọt.`;
      } else {
        matched = [DEFAULT_PRODUCTS.find(p => p.id === 1)];
        reply = `Dạ mẫu Dao Chef thép không gỉ chất lượng chuẩn của EuroAsia có giá **320.000đ**. Mời anh/chị tham khảo thông số bên dưới:`;
      }
    }
    // 1.4 Ngân sách chung (ví dụ "dưới 50 nghìn", "dưới 100k", "dưới 500k")
    else {
      matched = DEFAULT_PRODUCTS
        .filter(p => (p.current_price ?? p.price) <= budget)
        .sort((a, b) => (b.current_price ?? b.price) - (a.current_price ?? a.price));

      if (matched.length > 0) {
        if (budget <= 50000) {
          reply = `Dạ với mức ngân sách dưới ${formatVND(budget)}, EuroAsia Kitchen xin gợi ý sản phẩm **Thìa Inox 304 Bàn Ăn** giá chỉ **45.000đ** (đang giảm 25% từ 60.000đ):\n\n` +
            `✨ **Đặc điểm nổi bật:**\n` +
            `• Chất liệu inox 304 cao cấp, sáng bóng như gương, không hoen gỉ qua thời gian.\n` +
            `• Cán cầm đầm tay, viền mép bo mịn an toàn tuyệt đối cho người lớn và trẻ nhỏ.\n` +
            `• Thích hợp cho bữa cơm gia đình hoặc trang bị đồng bộ bàn tiệc.`;
        } else if (budget <= 200000) {
          reply = `Dạ với ngân sách dưới ${formatVND(budget)}, EuroAsia có các dụng cụ bàn ăn inox 304 cao cấp rất tiện ích và bền đẹp:`;
        } else if (budget <= 500000) {
          reply = `Dạ với ngân sách dưới ${formatVND(budget)}, anh/chị có rất nhiều lựa chọn chất lượng cao chuẩn Châu Âu đang được giảm giá tốt tại EuroAsia:\n\n` +
            `• **Dao Bếp Chef** (320k) - Cắt thái ngọt lịm mọi thực phẩm.\n` +
            `• **Chảo Chống Dính Đá** (380k) - Chiên xào ít dầu mỡ, không lo dính chảo.\n` +
            `• **Nồi Inox 3 Đáy** (450k) - Bắt từ nhanh, giữ nhiệt lâu.`;
        } else {
          reply = `Dạ với ngân sách dưới ${formatVND(budget)}, anh/chị có thể lựa chọn hầu hết các sản phẩm best-seller tại EuroAsia Kitchen:`;
        }
      } else {
        // Ngân sách quá thấp (ví dụ < 45k)
        matched = [DEFAULT_PRODUCTS.find(p => p.id === 8)];
        reply = `Dạ hiện tại sản phẩm có mức giá tiết kiệm nhất tại EuroAsia Kitchen là **Thìa Inox 304 Bàn Ăn** với giá chỉ **45.000đ** (giá gốc 60.000đ).\n\n` +
          `Với mức ngân sách ${formatVND(budget)}, anh/chị có thể cân nhắc thêm chút ít để sở hữu món đồ gia dụng inox 304 bền đẹp này nhé!`;
      }
    }
  }

  // --- TRƯỜNG HỢP 2: TƯ VẤN SÂU THEO LOẠI SẢN PHẨM ---
  else if (isKnife) {
    matched = DEFAULT_PRODUCTS.filter(p => p.id === 1);
    reply = `Dạ EuroAsia Kitchen xin tư vấn chi tiết về mẫu **Dao Bếp Chef Cao Cấp** (320.000đ - giảm 20%):\n\n` +
      `🔪 **Chất liệu:** Thép không gỉ đạt độ cứng cao HRC 58+, lưỡi dao mài vát kép siêu bén, giữ cạnh sắc lâu gấp 3 lần dao thông thường.\n` +
      `⚖️ **Cân bằng:** Cổ dao đúc liền khối và cán gỗ công thái học trợ lực, thái thịt, cá, rau củ mỏng tang không bị mỏi tay.\n` +
      `🛡️ **Bảo hành:** Cam kết bén ngọt, bảo hành 1 đổi 1 trong 30 ngày nếu phát hiện lỗi rèn.`;
  }
  else if (isPan) {
    matched = DEFAULT_PRODUCTS.filter(p => p.id === 7 || p.id === 4);
    reply = `Dạ EuroAsia xin gợi ý 2 mẫu chảo chống dính được khách hàng đánh giá cao nhất:\n\n` +
      `1️⃣ **Chảo Chống Dính Đá Hoa Cương** (380.000đ): Chuyên rán, chiên trứng cá siêu mượt với lớp men đá khoáng không PFOA, tiết kiệm dầu ăn.\n` +
      `2️⃣ **Chảo Xào Lòng Sâu** (520.000đ): Lòng chảo sâu thoải mái đảo xào thức ăn số lượng lớn không văng dầu, có nắp kính chịu nhiệt.\n\n` +
      `👉 Cả 2 mẫu đều có đáy từ phẳng 100%, dùng cực nhạy trên mọi loại bếp từ!`;
  }
  else if (isPot) {
    matched = DEFAULT_PRODUCTS.filter(p => p.id === 2 || p.id === 6);
    reply = `Dạ EuroAsia xin tư vấn 2 dòng nồi inox cao cấp phục vụ đa dạng nhu cầu bếp:\n\n` +
      `🍲 **Nồi Inox 3 Đáy** (450.000đ): Thân nồi dày dặn, đáy 3 lớp (Inox - Nhôm - Inox) tỏa nhiệt đồng đều, nấu canh kho thịt không bị cháy đáy.\n` +
      `🥟 **Nồi Hấp Đa Năng 2 Tầng** (1.200.000đ): Đường kính lớn hấp được gà nguyên con hoặc xôi đỗ, tầng dưới nấu canh luộc tiện lợi.\n\n` +
      `👉 Chất liệu Inox chuẩn chống ăn mòn muối mắm, an toàn tuyệt đối cho sức khỏe!`;
  }
  else if (isSpoon) {
    matched = DEFAULT_PRODUCTS.filter(p => p.id === 8 || p.id === 5);
    reply = `Dạ về dụng cụ bàn ăn, EuroAsia có 2 lựa chọn inox 304 chuẩn bền đẹp:\n\n` +
      `🥄 **Thìa Inox 304 Bàn Ăn** (45.000đ/chiếc): Cán dập nổi thanh lịch, bề mặt bóng gương sang trọng.\n` +
      `📦 **Bộ Thìa Muỗng Nhà Bếp Tiện Lợi** (180.000đ): Đầy đủ muôi canh, muỗng xới cơm, muỗng lẩu đồng bộ cho gian bếp.`;
  }

  // --- TRƯỜNG HỢP 3: TƯ VẤN CÔNG NĂNG & TÍNH NĂNG (BẾP TỪ, AN TOÀN, VỆ SINH) ---
  else if (text.includes('bếp từ') || text.includes('kén bếp') || text.includes('đáy từ')) {
    matched = DEFAULT_PRODUCTS.filter(p => p.id === 7 || p.id === 2 || p.id === 6);
    reply = `Dạ 100% các dòng nồi và chảo của EuroAsia Kitchen đều được trang bị **đế từ tính phẳng cao cấp chuẩn Châu Âu**:\n\n` +
      `⚡ **Bắt từ cực nhanh:** Nhận nhiệt ngay cả trên những bếp từ nhập khẩu kén nồi như Bosch, Hafele, Munchen, Panasonic...\n` +
      `🛡️ **Chống cong vênh:** Đáy dày chống phồng rộp khi nấu ở công suất cao.\n\n` +
      `Anh/chị tham khảo các mẫu nồi chảo bắt từ tốt nhất dưới đây nhé:`;
  }
  else if (text.includes('bảo hành') || text.includes('đổi trả') || text.includes('chính sách')) {
    matched = DEFAULT_PRODUCTS.slice(0, 2);
    reply = `Dạ EuroAsia Kitchen cam kết chính sách bảo hành chính hãng rõ ràng:\n\n` +
      `🛡️ **Thời gian bảo hành:** 12 tháng với thân nồi, chảo inox; 6 tháng với lớp chống dính và dao kéo.\n` +
      `🔄 **Đổi mới trong 30 ngày:** Lỗi cong vênh, rò đáy hoặc bong tróc do nhà sản xuất được đổi mới miễn phí tận nhà.\n` +
      `📦 **Kiểm tra khi nhận hàng:** Khách hàng được mở hộp kiểm tra hàng trước khi thanh toán (COD).`;
  }
  else if (text.includes('ship') || text.includes('giao hàng') || text.includes('vận chuyển') || text.includes('phí')) {
    matched = DEFAULT_PRODUCTS.slice(0, 2);
    reply = `Dạ chính sách giao hàng của EuroAsia Kitchen như sau:\n\n` +
      `🚚 **Miễn phí vận chuyển (Freeship):** Áp dụng cho mọi đơn hàng từ 500.000đ trên toàn quốc.\n` +
      `⏱️ **Thời gian giao:** Nội thành giao trong 24 giờ, các tỉnh thành khác từ 2-3 ngày làm việc.\n` +
      `📦 Hàng được bọc xốp chống sốc nhiều lớp cẩn thận trước khi xuất kho!`;
  }
  else if (text.includes('tân gia') || text.includes('quà tặng') || text.includes('combo') || text.includes('nhà mới')) {
    matched = DEFAULT_PRODUCTS.filter(p => p.id === 1 || p.id === 7 || p.id === 2);
    reply = `Dạ để làm quà tân gia hoặc chuẩn bị cho gian bếp mới, EuroAsia xin gợi ý **Bộ 3 Thiết Yếu** được khách hàng chọn nhiều nhất:\n\n` +
      `1️⃣ **Dao Chef Cao Cấp** (320k) - Đại diện cho sự chỉn chu, sắc bén.\n` +
      `2️⃣ **Chảo Chống Dính Đá** (380k) - Chiên rán hàng ngày tiện lợi.\n` +
      `3️⃣ **Nồi Inox 3 Đáy** (450k) - Bền bỉ nấu canh kho thịt.\n\n` +
      `👉 Trọn bộ chỉ khoảng 1.150.000đ là đầy đủ mọi nhu cầu cơ bản cho gian bếp hiện đại!`;
  }
  else if (text.includes('còn hàng') || text.includes('sẵn') || text.includes('danh sách')) {
    matched = DEFAULT_PRODUCTS.filter(p => p.stock > 0);
    reply = `Dạ hiện tại kho EuroAsia đang có sẵn ${matched.length} sản phẩm nhà bếp chất lượng cao còn hàng, sẵn sàng giao ngay trong ngày:`;
  }
  else {
    matched = DEFAULT_PRODUCTS.slice(0, 3);
    reply = `Dạ EuroAsia Kitchen xin chào anh/chị! Em là trợ lý AI chuyên tư vấn dụng cụ nhà bếp chất lượng Châu Âu.\n\n` +
      `Em có thể tư vấn chuyên sâu theo:\n` +
      `• **Ngân sách:** ví dụ *"dưới 50 nghìn"*, *"dưới 500k"*, *"khoảng 1 triệu"...*\n` +
      `• **Nhu cầu cụ thể:** *"nồi nấu bếp từ"*, *"chảo chiên không dính"*, *"dao thái sắc ngọt"*, *"bộ quà tân gia"...*\n\n` +
      `Anh/chị đang quan tâm đến món đồ nào hoặc mức ngân sách bao nhiêu để em hỗ trợ nhé!`;
  }

  return {
    reply,
    products: matched.map(p => ({
      id: p.id,
      name: p.name,
      price: p.current_price ?? p.price,
      price_formatted: formatVND(p.current_price ?? p.price),
      original_price: p.original_price,
      image_url: p.image_url,
      stock: p.stock,
      rating_average: p.rating_average,
      category_name: p.category_name,
      detail_url: `/products/${p.id}`,
    })),
  };
}
