/**
 * Chat Router for EuroAsia Kitchen AI Product Advisor
 * Handles POST /api/chat with rate limiting, input validation, and error management.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const { processChatMessage } = require('../services/aiChatService');

const router = express.Router();

// Rate Limiter: Max 20 requests per minute per IP to prevent spam and excessive API costs
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Bạn đang gửi yêu cầu quá nhanh. Vui lòng đợi một lát trước khi thử lại.',
  },
});

/**
 * POST /api/chat
 * Body: { message: string, history?: Array<{ role: string, content: string }> }
 */
router.post('/chat', chatLimiter, async (req, res) => {
  try {
    const { message, history } = req.body;

    // 1. Input Validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Vui lòng cung cấp nội dung câu hỏi hợp lệ (message dạng chuỗi).',
      });
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({
        error: 'Nội dung tin nhắn không được để trống.',
      });
    }

    if (trimmed.length > 500) {
      return res.status(400).json({
        error: 'Nội dung tin nhắn quá dài. Vui lòng nhập tối đa 500 ký tự.',
      });
    }

    // Validate optional history
    let validHistory = [];
    if (Array.isArray(history)) {
      validHistory = history
        .filter(item => item && typeof item === 'object' && item.content)
        .slice(-6); // Limit to last 6 turns to reduce API tokens and prevent runaway context
    }

    // 2. Process Chat with Grounded AI Service
    const response = await processChatMessage({
      message: trimmed,
      history: validHistory,
    });

    return res.json({
      success: true,
      reply: response.reply,
      products: response.products,
      provider: response.provider,
    });
  } catch (error) {
    console.error('Lỗi khi xử lý chatbot:', error);
    return res.status(500).json({
      error: 'Hệ thống trợ lý AI đang bận hoặc gặp sự cố. Vui lòng thử lại sau giây lát.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
