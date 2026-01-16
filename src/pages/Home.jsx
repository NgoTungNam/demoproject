import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getAll({ limit: 6 }),
          categoryAPI.getAll()
        ])
        setFeaturedProducts(productsRes.data.content || productsRes.data || [])
        setCategories(categoriesRes.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback data for demo
        setFeaturedProducts([
          { id: 1, name: 'Bộ dao bếp cao cấp Boker', price: 2500000, imageUrl: '/images/products/dao.jpg', description: 'Bộ dao bếp cao cấp Boker với 5 dao và dụng cụ, chất liệu thép không gỉ, tay cầm chắc chắn, phù hợp cho mọi công việc trong bếp' },
          { id: 2, name: 'Nồi hấp inox đa năng', price: 1200000, imageUrl: '/images/products/noiinox.jpg', description: 'Nồi hấp đa tầng bằng inox 304 cao cấp, thiết kế nhiều tầng tiện lợi, tay cầm chắc chắn, an toàn sức khỏe, phù hợp cho mọi loại bếp' },
          { id: 3, name: 'Chảo chống dính', price: 300000, imageUrl: '/images/products/chao.jpg', description: 'Chảo chống dính không độc hại, an toàn cho sức khỏe' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="display-4 fw-bold mb-3">
                Dụng Cụ Bếp EuroAsia
              </h1>
              <p className="lead mb-4">
                Chất lượng Châu Âu - Giá cả hợp lý. Nâng tầm không gian bếp của bạn với những sản phẩm tốt nhất.
              </p>
              <Link to="/products" className="btn btn-light btn-lg">
                Khám Phá Ngay <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=800&q=80"
                className="img-fluid rounded shadow"
                alt="Bộ dao bếp cao cấp EuroAsia"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=EuroAsia+Kitchen'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-5">
          <div className="container">
            <h2 className="text-center mb-4">Danh Mục Sản Phẩm</h2>
            <div className="row">
              {categories.map((category) => (
                <div key={category.id} className="col-md-3 mb-3">
                  <Link
                    to={`/products?category=${category.id}`}
                    className="card text-decoration-none text-dark"
                  >
                    <div className="card-body text-center">
                      <i className="bi bi-box-seam fs-1 text-primary"></i>
                      <h5 className="mt-2">{category.name}</h5>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Sản Phẩm Nổi Bật</h2>
            <Link to="/products" className="btn btn-outline-primary">
              Xem Tất Cả <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-3">
              <i className="bi bi-truck fs-1 text-primary"></i>
              <h4 className="mt-3">Giao Hàng Nhanh</h4>
              <p>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</p>
            </div>
            <div className="col-md-4 mb-3">
              <i className="bi bi-shield-check fs-1 text-primary"></i>
              <h4 className="mt-3">Chất Lượng Đảm Bảo</h4>
              <p>100% sản phẩm chính hãng, bảo hành chính thức</p>
            </div>
            <div className="col-md-4 mb-3">
              <i className="bi bi-headset fs-1 text-primary"></i>
              <h4 className="mt-3">Hỗ Trợ 24/7</h4>
              <p>Đội ngũ tư vấn chuyên nghiệp, nhiệt tình</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

