import React from 'react'
import { Link } from 'react-router-dom'

const CheckoutSuccess = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="card">
            <div className="card-body py-5">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
              <h2 className="mt-4 mb-3">Đặt Hàng Thành Công!</h2>
              <p className="text-muted mb-4">
                Cảm ơn bạn đã đặt hàng tại EuroAsia. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể để xác nhận đơn hàng.
              </p>
              <div className="d-grid gap-2">
                <Link to="/products" className="btn btn-primary btn-lg">
                  Tiếp Tục Mua Sắm
                </Link>
                <Link to="/" className="btn btn-outline-secondary">
                  Về Trang Chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSuccess

