import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { orderAPI, API_BASE_URL } from '../services/api'
import { paymentService } from '../services/paymentService'

/* ─── Inline styles ─────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '40px 0 60px',
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    fontWeight: 800,
    fontSize: '2rem',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  subHeading: {
    color: '#6b7280',
    marginBottom: 32,
    fontSize: '0.95rem',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
    padding: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#1a1a2e',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '2px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: 12,
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#fafafa',
    boxSizing: 'border-box',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    fontSize: '0.85rem',
    color: '#374151',
    marginBottom: 6,
  },
  formGroup: { marginBottom: 18 },
  row: { display: 'flex', gap: 16 },
  halfWidth: { flex: 1 },

  /* Payment methods */
  methodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 14,
    marginTop: 4,
  },
  methodCard: (selected, color) => ({
    border: `2.5px solid ${selected ? color : '#e5e7eb'}`,
    borderRadius: 16,
    padding: '18px 16px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    background: selected ? `${color}12` : '#fff',
    transform: selected ? 'scale(1.02)' : 'scale(1)',
    boxShadow: selected ? `0 4px 20px ${color}30` : '0 2px 8px rgba(0,0,0,0.04)',
  }),
  methodIcon: {
    fontSize: 28,
    marginBottom: 6,
    display: 'block',
  },
  methodName: (selected, color) => ({
    fontWeight: 700,
    fontSize: '0.9rem',
    color: selected ? color : '#374151',
  }),
  methodDesc: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginTop: 3,
  },

  /* Bank info */
  bankInfo: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 16,
    padding: 20,
    color: '#fff',
    marginTop: 16,
  },
  bankRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: '0.9rem',
  },
  bankValue: { fontWeight: 700 },

  /* Order summary */
  summaryCard: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
    padding: 28,
    position: 'sticky',
    top: 24,
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  orderImg: {
    width: 52,
    height: 52,
    objectFit: 'cover',
    borderRadius: 10,
    background: '#f3f4f6',
  },
  orderItemName: { fontWeight: 600, fontSize: '0.88rem', color: '#1a1a2e' },
  orderItemSub: { fontSize: '0.78rem', color: '#9ca3af' },
  orderItemPrice: { marginLeft: 'auto', fontWeight: 700, color: '#6366f1', fontSize: '0.9rem' },

  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
  },
  totalLabel: { fontWeight: 600, color: '#374151' },
  totalValue: { fontWeight: 800, fontSize: '1.3rem', color: '#6366f1' },

  /* Submit button */
  submitBtn: (loading) => ({
    width: '100%',
    padding: '16px',
    borderRadius: 14,
    border: 'none',
    background: loading
      ? '#9ca3af'
      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.05rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s',
    boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
    letterSpacing: '0.02em',
  }),

  /* MoMo themed */
  momoNote: {
    background: '#fff0f6',
    border: '1.5px solid #ff6ab3',
    borderRadius: 12,
    padding: '14px 18px',
    marginTop: 14,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  vnpayNote: {
    background: '#fffbf0',
    border: '1.5px solid #ffb800',
    borderRadius: 12,
    padding: '14px 18px',
    marginTop: 14,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
}

/* ─── Payment method config ─────────────────────────────── */
const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng',
    short: 'COD',
    icon: '🚚',
    color: '#10b981',
    desc: 'Trả tiền mặt khi nhận hàng',
  },
  {
    id: 'momo',
    label: 'Ví điện tử MoMo',
    short: 'MoMo',
    icon: '💜',
    color: '#d63384',
    desc: 'Quét QR hoặc app MoMo',
  },
  {
    id: 'vnpay',
    label: 'Cổng thanh toán VNPay',
    short: 'VNPay',
    icon: '🏦',
    color: '#f59e0b',
    desc: 'ATM / Visa / Master / QR',
  },
  {
    id: 'bank',
    label: 'Chuyển khoản ngân hàng',
    short: 'Bank transfer',
    icon: '💳',
    color: '#6366f1',
    desc: 'Chuyển khoản thủ công',
  },
]

/* ─── Component ─────────────────────────────────────────── */
const Checkout = () => {
  const navigate = useNavigate()
  const { cartItems, getCartTotal, clearCart } = useCart()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0)

  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1584346133934-a3afd2a33832?w=200&q=80&auto=format&fit=crop'
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  // Kiểm tra form hợp lệ
  const isFormValid = () => {
    return form.fullName && form.email && form.phone && form.address && form.city;
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!isFormValid()) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng trước khi thanh toán.')
      // Scroll to top to show missing fields
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return
    }
    
    setLoading(true)

    try {
      // 0. Làm sạch số tiền (Phòng trường hợp có dấu phẩy hoặc ký tự đặc biệt)
      const rawTotal = getCartTotal();
      const totalAmount = typeof rawTotal === 'string' 
        ? parseInt(rawTotal.replace(/[^0-9]/g, '')) 
        : Math.round(rawTotal);

      // 1. Tạo đơn hàng trước
      const orderData = {
        shipping_name: form.fullName,
        shipping_address: `${form.address}, ${form.city}`,
        shipping_phone: form.phone,
        total_amount: totalAmount,
        user_id: JSON.parse(localStorage.getItem('user') || '{}').id || null,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: typeof item.price === 'string' ? parseInt(item.price.replace(/[^0-9]/g, '')) : item.price,
        })),
      }

      console.log('[Checkout] Gửi đơn hàng:', orderData);
      const orderRes = await orderAPI.create(orderData)
      const orderId = orderRes.data.orderId

      // 2. Xử lý theo phương thức thanh toán
      clearCart()

      if (paymentMethod === 'cod') {
        navigate(`/checkout/success?method=cod&orderId=${orderId}`)
      } else if (paymentMethod === 'bank') {
        navigate(`/checkout/success?method=bank&orderId=${orderId}`)
      } else if (paymentMethod === 'momo') {
        try {
          await paymentService.payWithMomo(
            orderId,
            totalAmount,
            `Thanh toan don hang #${orderId} - EuroAsia Kitchen`
          )
        } catch (err) {
          console.error('MoMo Payment Error:', err);
          alert('Không thể khởi tạo thanh toán MoMo: ' + (err.message || 'Lỗi hệ thống'));
        }
      } else if (paymentMethod === 'vnpay') {
        try {
          await paymentService.payWithVnpay(
            orderId,
            totalAmount,
            `Thanh toan don hang #${orderId}`
          )
        } catch (err) {
          console.error('VNPay Payment Error:', err);
          alert('Không thể khởi tạo thanh toán VNPay: ' + (err.message || 'Lỗi hệ thống'));
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi không xác định';
      alert(`Có lỗi xảy ra khi đặt hàng: ${errorMsg}`);
    } finally {
      setLoading(false)
    }
  }

  // Xử lý khi click vào thẻ phương thức thanh toán
  const handleMethodClick = (methodId) => {
    setPaymentMethod(methodId);
    
    // Nếu là MoMo hoặc VNPay và form đã điền xong, tự động submit luôn cho nhanh
    if ((methodId === 'momo' || methodId === 'vnpay') && isFormValid()) {
      // Đợi state update xong rồi gọi submit
      setTimeout(() => handleSubmit(), 100);
    }
  }

  if (cartItems.length === 0) {
    return (
      <div style={styles.page}>
        <div className="container text-center py-5">
          <div style={{ fontSize: 80 }}>🛒</div>
          <h3 style={{ fontWeight: 700, color: '#1a1a2e', marginTop: 16 }}>Giỏ hàng trống</h3>
          <p style={{ color: '#6b7280' }}>Hãy thêm sản phẩm trước khi thanh toán</p>
          <Link
            to="/products"
            style={{
              display: 'inline-block',
              marginTop: 12,
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
              borderRadius: 12,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    )
  }

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod)

  return (
    <div style={styles.page}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={styles.heading}>💳 Thanh Toán</h1>
          <p style={styles.subHeading}>
            Hoàn tất đơn hàng của bạn. Chọn phương thức thanh toán phù hợp.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* LEFT COLUMN */}
            <div className="col-lg-8">
              {/* Shipping info */}
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  <span>📦</span> Thông Tin Giao Hàng
                </h2>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Họ và Tên *</label>
                  <input
                    style={{
                      ...styles.input,
                      borderColor: focusedField === 'fullName' ? '#6366f1' : '#e5e7eb',
                    }}
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div style={styles.row}>
                  <div style={{ ...styles.formGroup, ...styles.halfWidth }}>
                    <label style={styles.label}>Email *</label>
                    <input
                      style={{
                        ...styles.input,
                        borderColor: focusedField === 'email' ? '#6366f1' : '#e5e7eb',
                      }}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div style={{ ...styles.formGroup, ...styles.halfWidth }}>
                    <label style={styles.label}>Số Điện Thoại *</label>
                    <input
                      style={{
                        ...styles.input,
                        borderColor: focusedField === 'phone' ? '#6366f1' : '#e5e7eb',
                      }}
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="0912 345 678"
                      required
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Địa Chỉ *</label>
                  <input
                    style={{
                      ...styles.input,
                      borderColor: focusedField === 'address' ? '#6366f1' : '#e5e7eb',
                    }}
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="123 Đường ABC, Phường XYZ"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Thành Phố / Tỉnh *</label>
                  <input
                    style={{
                      ...styles.input,
                      borderColor: focusedField === 'city' ? '#6366f1' : '#e5e7eb',
                    }}
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Hồ Chí Minh"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ghi Chú Đơn Hàng</label>
                  <textarea
                    style={{
                      ...styles.input,
                      borderColor: focusedField === 'notes' ? '#6366f1' : '#e5e7eb',
                      resize: 'vertical',
                      minHeight: 80,
                    }}
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('notes')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Giao giờ hành chính, gọi trước khi giao..."
                  />
                </div>
              </div>

              {/* Payment methods */}
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  <span>💳</span> Phương Thức Thanh Toán
                </h2>
                <div style={styles.methodGrid}>
                  {PAYMENT_METHODS.map((m) => (
                    <div
                      key={m.id}
                      style={styles.methodCard(paymentMethod === m.id, m.color)}
                      onClick={() => handleMethodClick(m.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleMethodClick(m.id)}
                    >
                      <span style={styles.methodIcon}>{m.icon}</span>
                      <div style={styles.methodName(paymentMethod === m.id, m.color)}>
                        {m.short}
                      </div>
                      <div style={styles.methodDesc}>{m.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Conditional info boxes */}
                {paymentMethod === 'bank' && (
                  <div style={styles.bankInfo}>
                    <div style={{ fontWeight: 800, marginBottom: 12, fontSize: '0.95rem' }}>
                      🏦 Thông Tin Chuyển Khoản
                    </div>
                    <div style={styles.bankRow}>
                      <span>Ngân hàng:</span>
                      <span style={styles.bankValue}>Vietcombank</span>
                    </div>
                    <div style={styles.bankRow}>
                      <span>Số tài khoản:</span>
                      <span style={styles.bankValue}>1234 5678 90</span>
                    </div>
                    <div style={styles.bankRow}>
                      <span>Chủ tài khoản:</span>
                      <span style={styles.bankValue}>EUROASIA KITCHEN</span>
                    </div>
                    <div style={styles.bankRow}>
                      <span>Nội dung CK:</span>
                      <span style={styles.bankValue}>
                        {form.fullName || '[Họ Tên]'} {form.phone || '[SĐT]'}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: '0.78rem',
                        opacity: 0.8,
                        lineHeight: 1.5,
                      }}
                    >
                      ⚠️ Đơn hàng sẽ được xử lý trong 1–2 giờ sau khi nhận được chuyển khoản.
                    </div>
                  </div>
                )}

                {paymentMethod === 'momo' && (
                  <div style={styles.momoNote}>
                    <span style={{ fontSize: 22 }}>💜</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#d63384', marginBottom: 4 }}>
                        Thanh toán qua MoMo Sandbox
                      </div>
                      <div style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.6 }}>
                        Bạn sẽ được chuyển đến cổng thanh toán MoMo test (sandbox).
                        Sử dụng tài khoản test để thử nghiệm, không trừ tiền thật.
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'vnpay' && (
                  <div style={styles.vnpayNote}>
                    <span style={{ fontSize: 22 }}>🏦</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
                        Thanh toán qua VNPay Sandbox
                      </div>
                      <div style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.6 }}>
                        Hỗ trợ ATM nội địa, Visa/Master/JCB và QR Code.
                        Môi trường test — không trừ tiền thật.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN — Order summary */}
            <div className="col-lg-4">
              <div style={styles.summaryCard}>
                <h2 style={styles.sectionTitle}>
                  <span>🧾</span> Đơn Hàng Của Bạn
                </h2>

                <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 8 }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={styles.orderItem}>
                      <img
                        src={getImageUrl(item.imageUrl || item.image_url)}
                        alt={item.name}
                        style={styles.orderImg}
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1584346133934-a3afd2a33832?w=200&q=80&auto=format&fit=crop'
                        }}
                      />
                      <div>
                        <div style={styles.orderItemName}>{item.name}</div>
                        <div style={styles.orderItemSub}>
                          {formatPrice(item.price)} × {item.quantity}
                        </div>
                      </div>
                      <div style={styles.orderItemPrice}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: 12 }}>
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Tạm tính</span>
                    <span style={{ color: '#374151', fontWeight: 600 }}>
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Phí vận chuyển</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>Miễn phí</span>
                  </div>
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Phương thức</span>
                    <span
                      style={{
                        background: `${selectedMethod?.color}20`,
                        color: selectedMethod?.color,
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: '0.82rem',
                      }}
                    >
                      {selectedMethod?.icon} {selectedMethod?.short}
                    </span>
                  </div>
                  <div
                    style={{
                      ...styles.totalRow,
                      borderTop: '2px solid #f0f0f0',
                      marginTop: 8,
                    }}
                  >
                    <span style={styles.totalLabel}>Tổng cộng</span>
                    <span style={styles.totalValue}>{formatPrice(getCartTotal())}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={styles.submitBtn(loading)}
                >
                  {loading ? (
                    '⏳ Đang xử lý...'
                  ) : paymentMethod === 'momo' ? (
                    '💜 Thanh Toán MoMo'
                  ) : paymentMethod === 'vnpay' ? (
                    '🏦 Thanh Toán VNPay'
                  ) : (
                    '✅ Đặt Hàng Ngay'
                  )}
                </button>

                <div
                  style={{
                    textAlign: 'center',
                    marginTop: 16,
                    fontSize: '0.78rem',
                    color: '#9ca3af',
                    lineHeight: 1.6,
                  }}
                >
                  🔒 Thông tin của bạn được bảo mật tuyệt đối.
                  <br />
                  Bằng cách đặt hàng, bạn đồng ý với{' '}
                  <a href="#" style={{ color: '#6366f1' }}>
                    Điều Khoản Dịch Vụ
                  </a>{' '}
                  của chúng tôi.
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout
