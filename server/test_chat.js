/**
 * Test script for AI Chatbot Service
 * Verifies MySQL product queries, budget extraction, and grounded response structure.
 */

require('dotenv').config();
const { processChatMessage, extractBudget, extractKeywords } = require('./services/aiChatService');

async function runTests() {
  console.log('=============================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ BACKEND AI CHATBOT SERVICE');
  console.log('=============================================\n');

  // Test 1: Budget & Keyword Extraction
  console.log('--- TEST 1: Phân tích câu hỏi tiếng Việt (ngân sách & từ khóa) ---');
  const sample1 = 'Tôi muốn tìm mua chảo chống dính dưới 500k để chiên cá';
  const budget1 = extractBudget(sample1);
  const kw1 = extractKeywords(sample1);
  console.log(`Câu hỏi: "${sample1}"`);
  console.log('Ngân sách trích xuất:', budget1);
  console.log('Từ khóa trích xuất:', kw1);

  const sample2 = 'Có nồi inox nào tầm 1 triệu không shop?';
  const budget2 = extractBudget(sample2);
  const kw2 = extractKeywords(sample2);
  console.log(`\nCâu hỏi: "${sample2}"`);
  console.log('Ngân sách trích xuất:', budget2);
  console.log('Từ khóa trích xuất:', kw2);

  // Test 2: Process Chat Message for "chảo dưới 500k"
  console.log('\n--- TEST 2: Tư vấn sản phẩm thực tế theo yêu cầu ---');
  try {
    const res1 = await processChatMessage({
      message: 'Tôi muốn tìm chảo chống dính giá dưới 500k',
    });
    console.log('Provider sử dụng:', res1.provider);
    console.log('Câu trả lời tư vấn:\n', res1.reply);
    console.log('Danh sách sản phẩm được đề xuất:');
    res1.products.forEach((p, idx) => {
      console.log(`  ${idx + 1}. [ID: ${p.id}] ${p.name} - Giá: ${p.price_formatted} - Kho: ${p.stock} - Link: ${p.detail_url}`);
    });

    if (res1.products.length > 0) {
      console.log('✅ TEST 2 THÀNH CÔNG: Đã trả về sản phẩm thực tế từ MySQL!');
    } else {
      console.log('⚠️ TEST 2: Không có sản phẩm nào được gợi ý');
    }
  } catch (err) {
    console.error('❌ TEST 2 THẤT BẠI:', err);
  }

  // Test 3: Process Chat Message for "Dao bếp"
  console.log('\n--- TEST 3: Tư vấn sản phẩm dao bếp ---');
  try {
    const res2 = await processChatMessage({
      message: 'Tư vấn cho tôi dao bếp sắc bén để nấu ăn gia đình',
    });
    console.log('Provider sử dụng:', res2.provider);
    console.log('Câu trả lời tư vấn:\n', res2.reply);
    console.log('Danh sách sản phẩm được đề xuất:');
    res2.products.forEach((p, idx) => {
      console.log(`  ${idx + 1}. [ID: ${p.id}] ${p.name} - Giá: ${p.price_formatted} - Kho: ${p.stock} - Link: ${p.detail_url}`);
    });
    console.log('✅ TEST 3 HOÀN TẤT!');
  } catch (err) {
    console.error('❌ TEST 3 THẤT BẠI:', err);
  }

  // Test 4: Validation Error Handling
  console.log('\n--- TEST 4: Kiểm tra kiểm soát lỗi dữ liệu đầu vào ---');
  try {
    await processChatMessage({ message: '' });
    console.log('❌ TEST 4 LỖI: Lẽ ra phải từ chối tin nhắn rỗng');
  } catch (err) {
    console.log('✅ TEST 4 THÀNH CÔNG: Chặn tin nhắn rỗng đúng cách:', err.message);
  }

  console.log('\n=============================================');
  console.log('🎉 TẤT CẢ KIỂM THỬ BACKEND ĐÃ HOÀN TẤT!');
  console.log('=============================================');
  process.exit();
}

runTests();
