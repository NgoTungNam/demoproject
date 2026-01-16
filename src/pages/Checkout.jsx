import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { orderAPI } from '../services/api'

const Checkout = () => {
  const navigate = useNavigate()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getCartTotal()
      }

      await orderAPI.create(orderData)
      clearCart()
      navigate('/checkout/success')
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Giỏ hàng của bạn đang trống. <Link to="/products">Tiếp tục mua sắm</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Thanh Toán</h2>
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Thông Tin Giao Hàng</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Họ và Tên *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Số Điện Thoại *</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Địa Chỉ *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Thành Phố *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phương Thức Thanh Toán *</label>
                  <select
                    className="form-select"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                  >
                    <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                    <option value="bank">Chuyển khoản ngân hàng</option>
                    <option value="card">Thẻ tín dụng/Ghi nợ</option>
                  </select>
                </div>
                {formData.paymentMethod === 'bank' && (
                  <div className="alert alert-info mt-2">
                    <strong>Thông tin chuyển khoản:</strong><br />
                    Ngân hàng: Vietcombank<br />
                    Số tài khoản: 1234567890<br />
                    Chủ tài khoản: EUROASIA KITCHEN<br />
                    Nội dung: {formData.fullName || '[Họ Tên]'} - {formData.phone || '[SĐT]'}
                  </div>
                )}
                {formData.paymentMethod === 'card' && (
                  <div className="alert alert-secondary mt-2">
                    Hệ thống thanh toán thẻ đang bảo trì. Vui lòng chọn phương thức khác hoặc tiếp tục để mô phỏng thành công.
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Ghi Chú</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt Hàng'}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Đơn Hàng</h5>
            </div>
            <div className="card-body">
              {cartItems.map((item) => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Tổng cộng:</strong>
                <strong className="text-primary fs-5">{formatPrice(getCartTotal())}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

