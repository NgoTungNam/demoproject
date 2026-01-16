import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-dark text-light mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold">EuroAsia</h5>
            <p>Chuyên cung cấp dụng cụ bếp chất lượng cao từ Châu Âu và Châu Á</p>
          </div>
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold">Liên Hệ</h5>
            <p>
              <i className="bi bi-geo-alt"></i> Số nhà 8, Thượng Cát, Hà Nội<br />
              <i className="bi bi-telephone"></i> Hotline: 0965214607<br />
              <i className="bi bi-envelope"></i> Email: info@euroasia.com
            </p>
          </div>
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold">Theo Dõi Chúng Tôi</h5>
            <div>
              <a href="#" className="text-light me-3 fs-4">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-light me-3 fs-4">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-light me-3 fs-4">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>
        </div>
        <hr className="bg-light" />
        <div className="text-center">
          <p className="mb-0">&copy; 2024 EuroAsia. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

