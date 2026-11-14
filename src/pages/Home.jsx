import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

/* Flash Sale Banner with live countdown */
const FlashSaleBanner = () => {
  const [flashData, setFlashData] = useState(null)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    fetch('/api/flash-sales/active')
      .then(r => r.json())
      .then(data => {
        if (data.active && data.program) {
          setFlashData(data)
          const tick = () => setRemaining(Math.max(0, new Date(data.program.end_time) - new Date()))
          tick()
          const t = setInterval(tick, 1000)
          return () => clearInterval(t)
        }
      })
      .catch(() => {})
  }, [])

  if (!flashData) return null

  const { program, items } = flashData
  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  const pad = n => String(n).padStart(2, '0')
  const fmt = p => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0)

  return (
    <section style={{
      background: 'linear-gradient(135deg,#1a0000 0%,#3d0000 40%,#7a0000 100%)',
      padding: '32px 0'
    }}>
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <div style={{ color: '#ff9500', fontWeight: 900, fontSize: '1.8rem', letterSpacing: -1 }}>
              ⚡ FLASH SALE
            </div>
            <div style={{ color: '#fff', fontSize: '1rem', opacity: 0.8 }}>{program.title || program.name}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#fff', opacity: 0.7, fontSize: '0.9rem' }}>Kết thúc sau:</span>
            {[pad(h)+'h', pad(m)+'m', pad(s)+'s'].map((t, i) => (
              <span key={i} style={{
                background: '#111', color: '#ff9500', borderRadius: 8,
                padding: '6px 12px', fontFamily: 'monospace',
                fontWeight: 900, fontSize: '1.3rem', minWidth: 52, textAlign: 'center'
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="row g-3">
          {items.slice(0, 4).map(item => (
            <div key={item.product_id} className="col-6 col-md-3">
              <Link to={`/products/${item.product_id}`} className="text-decoration-none">
                <div style={{
                  background: 'rgba(255,255,255,0.07)', borderRadius: 14,
                  padding: 12, border: '1px solid rgba(255,150,0,0.2)',
                  transition: 'transform 0.2s', cursor: 'pointer'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <img
                    src={item.image_url?.startsWith('http') || item.image_url?.startsWith('/') ? item.image_url : '/images/products/noiinox.jpg'}
                    alt={item.product_name}
                    style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                    onError={e => { e.target.onerror = null; e.target.src = '/images/products/noiinox.jpg' }}
                  />
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4, lineHeight: 1.3 }}>
                    {item.product_name}
                  </div>
                  <div style={{ color: '#ff9500', fontWeight: 900, fontSize: '1rem' }}>
                    {fmt(item.flash_price)}
                  </div>
                  {item.regular_price > item.flash_price && (
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                        {fmt(item.regular_price)}
                      </span>
                      <span style={{ background: '#ff4d4d', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                        -{item.discount_percent}%
                      </span>
                    </div>
                  )}
                  <div style={{ marginTop: 6 }}>
                    <div style={{ background: '#333', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, ((item.flash_price > 0 ? 50 - item.remaining_quantity : 50) / 50) * 100)}%`,
                        height: '100%', background: 'linear-gradient(90deg,#ff4d4d,#ff9500)'
                      }}></div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginTop: 2 }}>
                      Còn {item.remaining_quantity} sản phẩm
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.allSettled([
          productAPI.getAll({ limit: 6 }),
          categoryAPI.getAll()
        ])
        if (productsRes.status === 'fulfilled') {
          const pData = productsRes.value.data
          setFeaturedProducts(pData?.content || pData || [])
        } else {
          console.error('Lỗi tải sản phẩm nổi bật:', productsRes.reason)
        }

        if (categoriesRes.status === 'fulfilled') {
          setCategories(categoriesRes.value.data || [])
        } else {
          console.error('Lỗi tải danh mục:', categoriesRes.reason)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
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

      {/* Flash Sale Banner - shows only when active */}
      <FlashSaleBanner />

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

