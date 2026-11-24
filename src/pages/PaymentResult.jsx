import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../services/api'

const methodLabel = {
  momo: { name: 'Ví MoMo', icon: '💜', color: '#d63384' },
  vnpay: { name: 'Cổng VNPay', icon: '🏦', color: '#f59e0b' },
  cod: { name: 'Thanh toán khi nhận hàng', icon: '🚚', color: '#10b981' },
  bank: { name: 'Chuyển khoản ngân hàng', icon: '💳', color: '#d32f2f' },
}

const PaymentResult = () => {
  const [params] = useSearchParams()
  const { clearCart } = useCart()

  const momoResultCode = params.get('resultCode')
  const vnpResponseCode = params.get('vnp_ResponseCode')
  const statusParam = params.get('status')

  // Tự động nhận diện method nếu không có param method
  let method = params.get('method')
  if (!method) {
    if (momoResultCode !== null || params.get('partnerCode') === 'MOMO') {
      method = 'momo'
    } else if (vnpResponseCode !== null || params.get('vnp_TxnRef')) {
      method = 'vnpay'
    } else {
      method = 'cod'
    }
  }

  const rawOrderId = params.get('orderId') || params.get('vnp_TxnRef')
  const orderId = rawOrderId ? rawOrderId.split('_')[0] : null
  const m = methodLabel[method] || methodLabel.cod
  const explicitFailure = (momoResultCode !== null && momoResultCode !== '0') ||
    (vnpResponseCode !== null && vnpResponseCode !== '00') || statusParam === 'failed'
  const [verifiedPaid, setVerifiedPaid] = useState(false)
  const isSuccess = verifiedPaid
  const isPending = !isSuccess && !explicitFailure

  // Payment success is determined by the backend gateway callback or verification endpoint
  useEffect(() => {
    if (!orderId || explicitFailure) return undefined

    // If MoMo returns with resultCode=0, trigger verify-return to update status
    if (method === 'momo' && momoResultCode === '0') {
      api.post('/payment/momo/verify-return', {
        orderId: rawOrderId,
        resultCode: momoResultCode,
        transId: params.get('transId'),
        amount: params.get('amount')
      }).then(() => {
        setVerifiedPaid(true)
        clearCart()
      }).catch(err => {
        console.error('Verify momo return error:', err)
      })
    }

    let attempts = 0
    let timer
    const checkStatus = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}/payment-status`)
        if (data.payment_status === 'paid') {
          setVerifiedPaid(true)
          clearCart()
          clearInterval(timer)
          return
        }
      } catch {}
      attempts += 1
      if (attempts >= 30) clearInterval(timer)
    }
    checkStatus()
    timer = setInterval(checkStatus, 2000)
    return () => clearInterval(timer)
  }, [orderId, explicitFailure, method, momoResultCode, rawOrderId])

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
          : isPending ? '#f3f4f6' : 'linear-gradient(135deg, #ffe0e0 0%, #fecaca 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        className="payment-card-box"
        style={{
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 8px 60px rgba(0,0,0,0.1)',
          padding: '40px 24px',
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
          {isSuccess ? '🎉' : isPending ? '⏳' : '❌'}
        </div>

        {/* Status */}
        <h1
          style={{
            fontWeight: 900,
            fontSize: '1.9rem',
            color: isSuccess ? '#059669' : isPending ? '#475569' : '#dc2626',
            marginBottom: 8,
          }}
        >
          {isSuccess ? 'Thanh Toán Thành Công!' : isPending ? 'Đang xác nhận thanh toán' : 'Thanh Toán Thất Bại'}
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
            : isPending ? 'Cổng thanh toán đang gửi kết quả. Trang sẽ tự cập nhật khi nhận xác nhận.'
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

        {/* MoMo QR Code khi đang chờ xác nhận */}
        {isPending && method === 'momo' && (
          <div style={{
            background: 'linear-gradient(135deg, #fff0f9, #fce4f3)',
            border: '2px solid #d63384',
            borderRadius: 20,
            padding: '24px 20px',
            marginBottom: 28,
            textAlign: 'center',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 28 }}>💜</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#d63384' }}>
                Quét mã QR để thanh toán MoMo
              </span>
            </div>
            {/* QR từ MoMo VietQR */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: 12,
              display: 'inline-block',
              boxShadow: '0 4px 20px rgba(214,51,132,0.15)',
              marginBottom: 16,
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `2|99|0965214607||EuroAsia Kitchen - Đơn hàng ${orderId ? '#' + orderId : ''}|0`
                )}`}
                alt="QR MoMo"
                style={{ width: 200, height: 200, display: 'block', borderRadius: 8 }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
            <div style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: 8 }}>
              Hoặc chuyển tiền thủ công qua MoMo:
            </div>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '12px 20px',
              display: 'inline-block',
              textAlign: 'left',
              fontSize: '0.9rem',
              minWidth: 240,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#6b7280' }}>Số điện thoại:</span>
                <span style={{ fontWeight: 700, color: '#d63384' }}>0965.214.607</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#6b7280' }}>Tên:</span>
                <span style={{ fontWeight: 700 }}>EuroAsia Kitchen</span>
              </div>
              {orderId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Nội dung CK:</span>
                  <span style={{ fontWeight: 700, color: '#d32f2f' }}>DH{orderId}</span>
                </div>
              )}
            </div>
            <div style={{
              marginTop: 14,
              padding: '10px 16px',
              background: '#fce4f3',
              borderRadius: 10,
              fontSize: '0.82rem',
              color: '#9d174d',
              fontWeight: 600,
            }}>
              ⚡ Trang sẽ tự cập nhật sau khi nhận được xác nhận thanh toán
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          {isSuccess ? (
            <>
              <Link
                to="/"
                style={{
                  display: 'block',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
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
                <strong style={{ color: '#d32f2f' }}>{count}s</strong>
              </p>
            </>
          ) : (
            <>
              <Link
                to="/cart"
                style={{
                  display: 'block',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
                  color: '#fff',
                  borderRadius: 12,
                  fontWeight: 800,
                  textDecoration: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(211, 47, 47, 0.3)',
                }}
              >
                🛒 Quay Lại Giỏ Hàng
              </Link>
              <Link
                to="/"
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
                🏠 Về Trang Chủ
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentResult
