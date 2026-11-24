import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { chatAPI, API_BASE_URL } from '../../services/api'
import { getClientChatResponse } from '../../services/clientChatAdvisor'
import './Chatbot.css'

const QUICK_SUGGESTIONS = [
  '🍳 Chảo chống dính dưới 500k',
  '🍲 Nồi inox cao cấp',
  '🔪 Dao bếp Chef chất lượng',
  '🥄 Dụng cụ bàn ăn inox',
  '📦 Xem sản phẩm đang còn hàng',
]

const INITIAL_MESSAGE = {
  id: 'init-1',
  sender: 'bot',
  text: 'Dạ xin chào anh/chị! Em là Trợ lý AI EuroAsia Kitchen 👩‍🍳.\nEm có thể tư vấn sản phẩm nhà bếp theo nhu cầu, ngân sách hoặc mục đích sử dụng. Anh/chị đang quan tâm đến món đồ nào ạ?',
  products: [],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)
  const [addedSuccessId, setAddedSuccessId] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { addToCart } = useCart()
  const navigate = useNavigate()

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen, messages, isLoading])

  // Hide tooltip after 8s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  const handleToggle = () => {
    setIsOpen(prev => !prev)
    setShowTooltip(false)
  }

  const handleResetChat = () => {
    setMessages([{
      ...INITIAL_MESSAGE,
      id: `init-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
  }

  const getProductImage = (url) => {
    if (!url) return '/images/products/noiinox.jpg'
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return url
    return `${API_BASE_URL}/${url}`
  }

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    setAddedSuccessId(product.id)
    setTimeout(() => {
      setAddedSuccessId(null)
    }, 1500)
  }

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim()
    if (!query || isLoading) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: now,
    }

    // Prepare history for API
    const historyPayload = messages
      .filter(m => m.id !== 'init-1' && m.text)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))
      .slice(-6)

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      try {
        const res = await chatAPI.sendMessage(query, historyPayload)
        const data = res.data

        if (data && data.reply) {
          const botMsg = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            products: Array.isArray(data.products) ? data.products : [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          setMessages(prev => [...prev, botMsg])
          return
        }
      } catch (error) {
        console.warn('Backend chat API offline or unreachable, using client advisor fallback:', error?.message)
      }

      // Client-side fallback: Trả lời thông minh ngay cả khi không kết nối được backend (e.g. Cloudflare deploy)
      const fallback = getClientChatResponse(query)
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: fallback.reply,
        products: fallback.products,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, botMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSendMessage(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
    }
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="euroasia-chat-launcher">
        {showTooltip && !isOpen && (
          <div className="chat-launcher-tooltip" onClick={handleToggle}>
            <span>👩‍🍳 Cần tư vấn dụng cụ bếp? Chat với AI ngay!</span>
            <i className="bi bi-x" onClick={(e) => { e.stopPropagation(); setShowTooltip(false) }}></i>
          </div>
        )}

        <button
          className="chat-launcher-btn"
          onClick={handleToggle}
          aria-label={isOpen ? 'Đóng cửa sổ chat' : 'Mở trợ lý AI tư vấn'}
          title="Trợ lý AI tư vấn sản phẩm EuroAsia"
        >
          <div className="chat-launcher-pulse"></div>
          <span className="chat-launcher-badge"></span>
          <i className={`chat-launcher-icon bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`}></i>
        </button>
      </div>

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="euroasia-chat-window" role="dialog" aria-modal="true" aria-label="EuroAsia AI Assistant">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-avatar">
                <i className="bi bi-robot"></i>
              </div>
              <div>
                <h3 className="chat-header-title">
                  Trợ Lý EuroAsia <i className="bi bi-patch-check-fill text-warning" style={{ fontSize: '13px' }}></i>
                </h3>
                <p className="chat-header-subtitle">
                  <span className="status-dot"></span> Đang trực tuyến • Sẵn sàng tư vấn
                </p>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                className="chat-header-btn"
                onClick={handleResetChat}
                title="Làm mới cuộc trò chuyện"
                aria-label="Làm mới"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
              <button
                className="chat-header-btn"
                onClick={handleToggle}
                title="Đóng chat"
                aria-label="Đóng"
              >
                <i className="bi bi-dash-lg"></i>
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="chat-suggestions">
            {QUICK_SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="chat-chip"
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-row ${msg.sender === 'user' ? 'chat-row-user' : 'chat-row-bot'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="chat-avatar-mini">
                    <i className="bi bi-robot"></i>
                  </div>
                )}

                <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                  {/* Grounded Recommended Product Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="chat-products-container">
                      {msg.products.map((prod) => (
                        <div key={prod.id} className="chat-product-card">
                          <div className="chat-product-img-wrap">
                            <img
                              src={getProductImage(prod.image_url)}
                              alt={prod.name}
                              className="chat-product-img"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = '/images/products/noiinox.jpg'
                              }}
                            />
                          </div>

                          <div className="chat-product-info">
                            <div>
                              <h4 className="chat-product-name" title={prod.name}>
                                {prod.name}
                              </h4>
                              <div className="chat-product-meta">
                                <span className="chat-product-price">
                                  {prod.price_formatted || `${Number(prod.price).toLocaleString('vi-VN')} ₫`}
                                </span>
                                <span className={`chat-stock-badge ${prod.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                                  {prod.stock > 0 ? `Còn hàng (${prod.stock})` : 'Tạm hết'}
                                </span>
                              </div>
                            </div>

                            <div className="chat-product-actions">
                              <Link
                                to={prod.detail_url || `/products/${prod.id}`}
                                className="chat-btn-view"
                                onClick={() => {
                                  // Keep chat open or minimize if on mobile
                                  if (window.innerWidth < 576) setIsOpen(false)
                                }}
                              >
                                <i className="bi bi-eye"></i> Chi tiết
                              </Link>

                              {prod.stock > 0 && (
                                <button
                                  type="button"
                                  className={`chat-btn-add ${addedSuccessId === prod.id ? 'added' : ''}`}
                                  onClick={(e) => handleAddToCart(e, prod)}
                                  title="Thêm vào giỏ hàng"
                                >
                                  {addedSuccessId === prod.id ? (
                                    <>
                                      <i className="bi bi-check-lg"></i> Đã thêm
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-cart-plus"></i> Thêm giỏ
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="chat-timestamp">{msg.timestamp}</div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="chat-row chat-row-bot">
                <div className="chat-avatar-mini">
                  <i className="bi bi-robot"></i>
                </div>
                <div className="chat-bubble chat-bubble-bot">
                  <div className="chat-typing">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <form onSubmit={handleSubmit} className="chat-form">
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Hỏi về nhu cầu, ngân sách của bạn..."
                value={input}
                maxLength={500}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!input.trim() || isLoading}
                aria-label="Gửi tin nhắn"
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </form>

            <div className="chat-input-footer">
              <span>💡 Gợi ý: "chảo dưới 500k", "nồi inox gia đình"</span>
              <span>{input.length}/500</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
