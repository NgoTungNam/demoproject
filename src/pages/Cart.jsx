import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-cart-x fs-1 text-muted"></i>
          <h3 className="mt-3">Giỏ hàng trống</h3>
          <p className="text-muted">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
          <Link to="/products" className="btn btn-primary">
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Giỏ Hàng Của Bạn</h2>
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              {cartItems.map((item) => (
                <div key={item.id} className="row align-items-center mb-3 pb-3 border-bottom">
                  <div className="col-md-2">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/100x100?text=EuroAsia'}
                      className="img-fluid rounded"
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=EuroAsia'
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <h5 className="mb-1">{item.name}</h5>
                    <p className="text-muted small mb-0">{formatPrice(item.price)}</p>
                  </div>
                  <div className="col-md-3">
                    <div className="input-group">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        min="1"
                      />
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-md-2 text-end">
                    <p className="fw-bold mb-1">{formatPrice(item.price * item.quantity)}</p>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Tổng Kết</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <span>Tạm tính:</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Phí vận chuyển:</span>
                <span className="text-success">Miễn phí</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Tổng cộng:</strong>
                <strong className="text-primary fs-5">{formatPrice(getCartTotal())}</strong>
              </div>
              <button
                className="btn btn-primary w-100 btn-lg"
                onClick={() => navigate('/checkout')}
              >
                Thanh Toán
              </button>
              <Link to="/products" className="btn btn-outline-secondary w-100 mt-2">
                Tiếp Tục Mua Sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

