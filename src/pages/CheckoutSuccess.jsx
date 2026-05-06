import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const methodConfig = {
  cod: {
    icon: '🚚',
    color: '#10b981',
    bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    title: 'Đặt Hàng Thành Công!',
    subtitle: 'Đơn hàng COD của bạn đã được xác nhận.',
    detail: 'Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Chúng tôi sẽ liên hệ xác nhận trong vòng 1-2 giờ.',
    badge: '💵 Thanh toán khi nhận hàng',
  },
  bank: {
    icon: '💳',
    color: '#6366f1',
    bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    title: 'Đơn Hàng Đã Được Ghi Nhận!',
    subtitle: 'Vui lòng hoàn tất chuyển khoản để xác nhận đơn hàng.',
    detail: null, // will render bank info block
    badge: '🏦 Chuyển khoản ngân hàng',
  },
  momo: {
    icon: '💜',
    color: '#d63384',
    bg: 'linear-gradient(135deg, #fff0f6 0%, #fce7f3 100%)',
    title: 'Thanh Toán MoMo Thành Công!',
    subtitle: 'Đơn hàng của bạn đã được xác nhận qua ví MoMo.',
    detail: 'Biên lai thanh toán đã được gửi đến ứng dụng MoMo của bạn.',
    badge: '💜 MoMo',
  },
  vnpay: {
    icon: '🏦',
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    title: 'Thanh Toán VNPay Thành Công!',
    subtitle: 'Đơn hàng của bạn đã được xác nhận qua VNPay.',
    detail: 'Hóa đơn điện tử sẽ được gửi đến email của bạn trong ít phút.',
    badge: '🏦 VNPay',
  },
}

const CheckoutSuccess = () => {
  const [params] = useSearchParams()
  const method = params.get('method') || 'cod'
  const orderId = params.get('orderId')
  const cfg = methodConfig[method] || methodConfig.cod

  const [count, setCount] = useState(10)

  useEffect(() => {
    // Only auto-redirect for paid methods (not bank transfer which needs manual action)
    if (method === 'bank') return
    const timer = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timer)
          window.location.href = '/'
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [method])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: cfg.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 28,
          boxShadow: '0 8px 60px rgba(0,0,0,0.1)',
          padding: '52px 44px',
          maxWidth: 540,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Animated icon */}
        <div
          style={{
            fontSize: 88,
            marginBottom: 12,
            display: 'inline-block',
            animation: 'pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275)',
          }}
        >
          {cfg.icon}
        </div>

        {/* Title */}
        <h1
          style={{
            fontWeight: 900,
            fontSize: '1.8rem',
            color: cfg.color,
            marginBottom: 8,
          }}
        >
          {cfg.title}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.6 }}>
          {cfg.subtitle}
        </p>

        {/* Order info card */}
        <div
          style={{
            background: '#f9fafb',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 24,
            textAlign: 'left',
          }}
        >
          {orderId && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem' }}>
              <span style={{ color: '#6b7280' }}>Mã đơn hàng:</span>
              <span style={{ fontWeight: 800, color: '#1a1a2e', fontSize: '1rem' }}>#{orderId}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem' }}>
            <span style={{ color: '#6b7280' }}>Phương thức:</span>
            <span
              style={{
                background: `${cfg.color}18`,
                color: cfg.color,
                padding: '3px 12px',
                borderRadius: 20,
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              {cfg.badge}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: '#6b7280' }}>Trạng thái:</span>
            <span
              style={{
                background: method === 'bank' ? '#fef3c7' : '#d1fae5',
                color: method === 'bank' ? '#d97706' : '#059669',
                padding: '3px 12px',
                borderRadius: 20,
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              {method === 'bank' ? '⏳ Chờ chuyển khoản' : '✅ Đã xác nhận'}
            </span>
          </div>
        </div>

        {/* Extra info */}
        {cfg.detail && (
          <div
            style={{
              background: `${cfg.color}0d`,
              border: `1.5px solid ${cfg.color}30`,
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 24,
              fontSize: '0.85rem',
              color: '#374151',
              lineHeight: 1.6,
              textAlign: 'left',
            }}
          >
            ℹ️ {cfg.detail}
          </div>
        )}

        {/* Bank transfer special block */}
        {method === 'bank' && (
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 16,
              padding: '20px 24px',
              marginBottom: 24,
              color: '#fff',
              textAlign: 'left',
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 14, fontSize: '0.95rem' }}>
              🏦 Thông Tin Chuyển Khoản
            </div>
            {[
              ['Ngân hàng', 'Vietcombank'],
              ['Số tài khoản', '1234 5678 90'],
              ['Chủ tài khoản', 'EUROASIA KITCHEN'],
              ['Nội dung CK', orderId ? `DH${orderId}` : 'Mã đơn hàng'],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}
              >
                <span style={{ opacity: 0.8 }}>{label}:</span>
                <span style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: '0.78rem', opacity: 0.85, lineHeight: 1.5 }}>
              ⚠️ Đơn hàng sẽ được xử lý trong 1–2 giờ sau khi nhận được chuyển khoản.
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            to="/"
            style={{
              display: 'block',
              padding: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
              borderRadius: 12,
              fontWeight: 800,
              textDecoration: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}
          >
            🏠 Về Trang Chủ
          </Link>
          <Link
            to="/products"
            style={{
              display: 'block',
              padding: '14px',
              background: '#f3f4f6',
              color: '#374151',
              borderRadius: 12,
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            🛍️ Tiếp Tục Mua Sắm
          </Link>
        </div>

        {method !== 'bank' && (
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: 16 }}>
            Tự động chuyển về trang chủ sau{' '}
            <strong style={{ color: '#6366f1' }}>{count}s</strong>
          </p>
        )}

        <style>{`
          @keyframes pop {
            0% { transform: scale(0.5); opacity: 0; }
            80% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}

export default CheckoutSuccess
