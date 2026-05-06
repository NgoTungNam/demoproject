import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

const methodLabel = {
  momo: { name: 'MoMo', icon: '💜', color: '#d63384' },
  vnpay: { name: 'VNPay', icon: '🏦', color: '#f59e0b' },
  cod: { name: 'Thanh toán khi nhận hàng', icon: '🚚', color: '#10b981' },
  bank: { name: 'Chuyển khoản ngân hàng', icon: '💳', color: '#6366f1' },
}

const PaymentResult = () => {
  const [params] = useSearchParams()
  const status = params.get('status') || 'success'
  const method = params.get('method') || 'cod'
  const orderId = params.get('orderId') || params.get('vnp_TxnRef')?.split('_')[0]
  const vnpResponseCode = params.get('vnp_ResponseCode')

  // VNPay trả về trực tiếp params trên URL return
  const isSuccess =
    status === 'success' ||
    (vnpResponseCode && vnpResponseCode === '00')

  const m = methodLabel[method] || methodLabel.cod

  const [count, setCount] = useState(8)
  useEffect(() => {
    if (!isSuccess) return
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
  }, [isSuccess])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isSuccess
          ? 'linear-gradient(135deg, #e0ffe8 0%, #d1fae5 100%)'
          : 'linear-gradient(135deg, #ffe0e0 0%, #fecaca 100%)',
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
          padding: '56px 48px',
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: 80,
            marginBottom: 16,
            animation: 'bounce 0.6s ease',
          }}
        >
          {isSuccess ? '🎉' : '❌'}
        </div>

        {/* Status */}
        <h1
          style={{
            fontWeight: 900,
            fontSize: '1.9rem',
            color: isSuccess ? '#059669' : '#dc2626',
            marginBottom: 8,
          }}
        >
          {isSuccess ? 'Thanh Toán Thành Công!' : 'Thanh Toán Thất Bại'}
        </h1>

        <p
          style={{
            color: '#6b7280',
            fontSize: '0.95rem',
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          {isSuccess
            ? 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.'
            : 'Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức khác.'}
        </p>

        {/* Info card */}
        <div
          style={{
            background: '#f9fafb',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 28,
            textAlign: 'left',
          }}
        >
          {orderId && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 10,
                fontSize: '0.9rem',
              }}
            >
              <span style={{ color: '#6b7280' }}>Mã đơn hàng:</span>
              <span style={{ fontWeight: 700, color: '#1a1a2e' }}>#{orderId}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
            }}
          >
            <span style={{ color: '#6b7280' }}>Phương thức:</span>
            <span
              style={{
                fontWeight: 700,
                color: m.color,
              }}
            >
              {m.icon} {m.name}
            </span>
          </div>
          {isSuccess && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 10,
                fontSize: '0.9rem',
              }}
            >
              <span style={{ color: '#6b7280' }}>Trạng thái:</span>
              <span
                style={{
                  background: '#d1fae5',
                  color: '#059669',
                  fontWeight: 700,
                  padding: '3px 12px',
                  borderRadius: 20,
                  fontSize: '0.82rem',
                }}
              >
                ✅ Đã xác nhận
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          {isSuccess ? (
            <>
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
              <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: 4 }}>
                Tự động chuyển về trang chủ sau{' '}
                <strong style={{ color: '#6366f1' }}>{count}s</strong>
              </p>
            </>
          ) : (
            <>
              <Link
                to="/checkout"
                style={{
                  display: 'block',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  borderRadius: 12,
                  fontWeight: 800,
                  textDecoration: 'none',
                  fontSize: '1rem',
                }}
              >
                🔄 Thử Lại Thanh Toán
              </Link>
              <Link
                to="/cart"
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
                🛒 Quay Lại Giỏ Hàng
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentResult
