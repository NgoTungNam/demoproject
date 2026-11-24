import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL, productAPI, categoryAPI } from '../services/api'
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_FLASH_SALES } from '../data/mockProducts'
import ProductCard from '../components/ProductCard'

/* ─── Hero Product Slider with Smooth Transitions & Motion Animation ─── */
const HERO_SLIDES = [
  {
    id: 1,
    tag: 'DỤNG CỤ BẾP',
    title: 'Dao Bếp Chef Cao Cấp',
    subtitle: 'Dao bếp Chef chuyên nghiệp bằng thép không gỉ cao cấp, độ sắc bén hoàn hảo, tay cầm công thái học chống trơn trượt.',
    price: 320000,
    original_price: 400000,
    discount: '-20%',
    image: '/images/products/dao.jpg',
    badge: 'CHÍNH HÃNG EUROASIA',
    rating: '5.0 ★ (Đã bán 49)',
    gradient: 'linear-gradient(135deg, #8b0000 0%, #b71c1c 50%, #d32f2f 100%)'
  },
  {
    id: 9,
    tag: 'THIẾT BỊ NHÀ BẾP',
    title: 'Nồi Chiên Không Dầu',
    subtitle: 'Nồi chiên không dầu cao cấp công nghệ châu âu',
    price: 3000000,
    original_price: 4000000,
    discount: '-25%',
    image: '/images/products/noichien.jpg',
    badge: 'CHÍNH HÃNG EUROASIA',
    rating: '5.0 ★ (Còn hàng 100)',
    gradient: 'linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #b71c1c 100%)'
  },
  {
    id: 10,
    tag: 'THIẾT BỊ NHÀ BẾP',
    title: 'Máy Ép Chậm Hoa Quả EuroAsia',
    subtitle: 'Máy ép chậm trái cây hoa quả giữ trọn dưỡng chất, ép kiệt bã, công nghệ trục vít xoắn ốc hiện đại, vận hành êm ái.',
    price: 1850000,
    original_price: 2450000,
    discount: '-24%',
    image: '/images/products/mayep.webp',
    badge: 'CHÍNH HÃNG EUROASIA',
    rating: '5.0 ★ (Đã bán 35)',
    gradient: 'linear-gradient(135deg, #4a0404 0%, #7f1d1d 50%, #991b1b 100%)'
  },
  {
    id: 7,
    tag: 'NỒI & CHẢO',
    title: 'Chảo Chống Dính Đá Hoa Cương',
    subtitle: 'Chảo chống dính đá hoa cương siêu bền, phủ lớp chống dính Teflon an toàn không chứa PFOA, tiết kiệm dầu ăn.',
    price: 380000,
    original_price: 500000,
    discount: '-24%',
    image: '/images/products/chao.jpg',
    badge: 'CHÍNH HÃNG EUROASIA',
    rating: '4.7 ★ (Đã bán 30)',
    gradient: 'linear-gradient(135deg, #7c1a00 0%, #c2410c 50%, #d97706 100%)'
  },
  {
    id: 2,
    tag: 'NỒI & CHẢO',
    title: 'Nồi Inox Cao Cấp 3 Đáy',
    subtitle: 'Nồi inox 3 đáy cao cấp, truyền nhiệt đều, giữ nhiệt tốt, sử dụng được cho mọi loại bếp kể cả bếp từ.',
    price: 450000,
    original_price: 600000,
    discount: '-25%',
    image: '/images/products/noiinox.jpg',
    badge: 'CHÍNH HÃNG EUROASIA',
    rating: '5.0 ★ (Đã bán 20)',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #831843 50%, #be123c 100%)'
  }
]

const HeroSlider = () => {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const slideCount = HERO_SLIDES.length

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slideCount)
    }, 4500)
    return () => clearInterval(timer)
  }, [isPaused, slideCount])

  const slide = HERO_SLIDES[current]
  const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0)

  return (
    <section
      className="hero-slider-section text-white py-5 position-relative"
      style={{ background: slide.gradient }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container py-3">
        <div className="row align-items-center g-4">
          {/* Left Text Column: Giao diện mẫu đẹp mắt, nội dung 100% từ sản phẩm thực tế */}
          <div className="col-lg-6 hero-content-anim" key={`text-${current}`}>
            <div className="mb-3">
              <span className="badge px-3 py-2 text-uppercase fw-bold" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', fontSize: '0.8rem', letterSpacing: '1px' }}>
                {slide.tag}
              </span>
            </div>
            <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              {slide.title}
            </h1>
            <p className="lead mb-4" style={{ opacity: 0.92, fontSize: '1.05rem', lineHeight: 1.6 }}>
              {slide.subtitle}
            </p>

            {/* Price & Discount */}
            <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
              <span className="fs-2 fw-bold text-warning" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                {fmt(slide.price)}
              </span>
              {slide.original_price && slide.original_price > slide.price && (
                <>
                  <span className="fs-5 text-white-50 text-decoration-line-through">
                    {fmt(slide.original_price)}
                  </span>
                  <span className="badge bg-danger fs-6 px-3 py-1 rounded-pill">
                    {slide.discount}
                  </span>
                </>
              )}
            </div>

            <div className="d-flex gap-3 flex-wrap">
              <Link to={`/products/${slide.id}`} className="btn btn-warning btn-lg fw-bold px-4 py-3 rounded-pill shadow-lg text-dark">
                <i className="bi bi-cart-plus me-2"></i>Xem Chi Tiết Sản Phẩm
              </Link>
              <Link to="/products" className="btn btn-outline-light btn-lg px-4 py-3 rounded-pill">
                Khám Phá Tất Cả <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>

          {/* Right Product Image Showcase with Motion Animation */}
          <div className="col-lg-6 text-center hero-image-anim" key={`img-${current}`}>
            <div className="hero-floating-card position-relative d-inline-block">
              {/* Top Badge */}
              <div
                className="position-absolute shadow"
                style={{
                  top: 18,
                  left: 18,
                  zIndex: 3,
                  background: 'linear-gradient(135deg, #ff4d4d, #ff9500)',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  letterSpacing: '0.5px'
                }}
              >
                {slide.badge}
              </div>

              {/* Bottom Rating Pill */}
              <div
                className="position-absolute shadow"
                style={{
                  bottom: 18,
                  right: 18,
                  zIndex: 3,
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffc107',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.82rem'
                }}
              >
                {slide.rating}
              </div>

              <img
                src={slide.image}
                className="hero-floating-img"
                alt={slide.title}
                style={{
                  maxHeight: '380px',
                  width: '100%',
                  objectFit: 'cover',
                  background: '#fff'
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/images/products/dao.jpg'
                }}
              />
            </div>
          </div>
        </div>

        {/* Carousel Controls: Arrows & Indicators */}
        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-white border-opacity-10">
          <div className="d-flex align-items-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <span
                key={idx}
                className={`hero-dot-indicator ${idx === current ? 'active' : ''}`}
                style={{ width: idx === current ? 32 : 12 }}
                onClick={() => setCurrent(idx)}
                title={`Chuyển tới slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="hero-nav-btn"
              onClick={() => setCurrent((prev) => (prev - 1 + slideCount) % slideCount)}
              aria-label="Previous Slide"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              className="hero-nav-btn"
              onClick={() => setCurrent((prev) => (prev + 1) % slideCount)}
              aria-label="Next Slide"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Flash Sale Banner with Live Countdown & Product Grid ─── */
const FlashSaleBanner = () => {
  const [flashData, setFlashData] = useState(null)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    let timer = null

    const loadFallback = () => {
      const rawLocal = localStorage.getItem('admin_flash_sales')
      const local = rawLocal ? JSON.parse(rawLocal) : null
      const sourceList = Array.isArray(local) ? local : DEFAULT_FLASH_SALES
      const now = new Date()
      const targetSale = sourceList.find(
        (s) =>
          s &&
          s.is_active !== 0 &&
          s.is_active !== false &&
          (!s.start_time || new Date(s.start_time) <= now) &&
          (!s.end_time || new Date(s.end_time) > now) &&
          Array.isArray(s.items) &&
          s.items.length > 0
      )

      if (!targetSale) {
        setFlashData(null)
        return
      }

      const endTime = targetSale.end_time ? new Date(targetSale.end_time) : new Date(Date.now() + 86400000 * 2)

      const fallbackItems = targetSale.items.map((it) => {
        const prod = DEFAULT_PRODUCTS.find((p) => p.id === Number(it.product_id))
        return {
          product_id: it.product_id,
          product_name: it.product_name || prod?.name || `Sản phẩm #${it.product_id}`,
          flash_price: it.flash_price || (prod ? Math.round(prod.price * 0.8) : 250000),
          regular_price: it.original_price || prod?.price || 350000,
          discount_percent: Math.round(((it.original_price || prod?.price || 350000) - (it.flash_price || 250000)) / (it.original_price || prod?.price || 350000) * 100),
          remaining_quantity: it.quantity || 15,
          image_url: prod?.image_url || '/images/products/chao.jpg'
        }
      })

      setFlashData({
        active: true,
        program: {
          title: targetSale.name || targetSale.title || 'GIỜ VÀNG BẾP XINH - ƯU ĐÃI ĐẾN 30%',
          end_time: endTime.toISOString()
        },
        items: fallbackItems
      })

      const tick = () => setRemaining(Math.max(0, endTime - new Date()))
      tick()
      timer = setInterval(tick, 1000)
    }

    fetch(`${API_BASE_URL}/api/flash-sales/active`)
      .then((r) => {
        if (!r.ok) throw new Error('API error')
        return r.json()
      })
      .then((data) => {
        if (data.active && data.program && data.items && data.items.length > 0) {
          setFlashData(data)
          const tick = () => setRemaining(Math.max(0, new Date(data.program.end_time) - new Date()))
          tick()
          timer = setInterval(tick, 1000)
        } else {
          // API trả lời thành công nhưng không có Flash Sale nào đang bật -> Ẩn banner
          setFlashData(null)
        }
      })
      .catch(() => {
        loadFallback()
      })

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [])

  if (!flashData) return null

  const { program, items } = flashData
  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  const pad = (n) => String(n).padStart(2, '0')
  const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0)

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #180303 0%, #300606 45%, #5a0909 100%)',
        padding: '38px 0',
        borderTop: '2px solid rgba(255, 149, 0, 0.25)',
        borderBottom: '2px solid rgba(255, 149, 0, 0.25)'
      }}
    >
      <div className="container">
        {/* Flash Sale Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <span className="flash-live-badge">
              <i className="bi bi-lightning-charge-fill"></i> ĐANG DIỄN RA
            </span>
            <div>
              <h2 className="mb-0 fw-black fw-bold" style={{ color: '#ff9500', fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                ⚡ FLASH SALE GIỜ VÀNG
              </h2>
              <div style={{ color: '#fed7aa', fontSize: '0.9rem', opacity: 0.85 }}>
                {program.title || 'Ưu đãi cực sốc - Số lượng có hạn!'}
              </div>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="d-flex align-items-center gap-2">
            <span style={{ color: '#fed7aa', fontWeight: 600, fontSize: '0.88rem' }}>Kết thúc sau:</span>
            <div className="d-flex gap-1 align-items-center">
              <div className="flash-timer-box">{pad(h)}<small style={{ display: 'block', fontSize: '0.55rem', color: '#aaa' }}>GIỜ</small></div>
              <span className="text-warning fw-bold fs-5">:</span>
              <div className="flash-timer-box">{pad(m)}<small style={{ display: 'block', fontSize: '0.55rem', color: '#aaa' }}>PHÚT</small></div>
              <span className="text-warning fw-bold fs-5">:</span>
              <div className="flash-timer-box">{pad(s)}<small style={{ display: 'block', fontSize: '0.55rem', color: '#aaa' }}>GIÂY</small></div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="row g-3">
          {items.slice(0, 4).map((item) => {
            const soldCount = Math.max(1, 50 - (item.remaining_quantity || 15))
            const percentSold = Math.min(95, Math.round((soldCount / 50) * 100))
            return (
              <div key={item.product_id} className="col-6 col-md-3">
                <Link to={`/products/${item.product_id}`} className="text-decoration-none">
                  <div className="flash-item-card h-100 d-flex flex-column">
                    {/* Discount badge */}
                    <div
                      className="position-absolute"
                      style={{
                        top: 10,
                        right: 10,
                        background: '#e11d48',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: 12,
                        zIndex: 2
                      }}
                    >
                      -{item.discount_percent || 20}%
                    </div>

                    <img
                      src={item.image_url?.startsWith('http') || item.image_url?.startsWith('/') ? item.image_url : '/images/products/chao.jpg'}
                      alt={item.product_name}
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/images/products/chao.jpg'
                      }}
                    />

                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', marginBottom: 6, lineHeight: 1.3, minHeight: 36 }}>
                      {item.product_name}
                    </div>

                    <div className="mt-auto">
                      <div className="d-flex align-items-baseline gap-2 mb-2">
                        <span style={{ color: '#ff9500', fontWeight: 900, fontSize: '1.15rem' }}>
                          {fmt(item.flash_price)}
                        </span>
                        {item.regular_price > item.flash_price && (
                          <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                            {fmt(item.regular_price)}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, height: 8, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentSold}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #ff4d4d, #ff9500)',
                            borderRadius: 10
                          }}
                        ></div>
                      </div>
                      <div className="d-flex justify-content-between text-white-50 mt-1" style={{ fontSize: '0.72rem' }}>
                        <span>Đã bán {percentSold}%</span>
                        <span className="text-warning">Còn {item.remaining_quantity || 15} cái</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── Main Home Component ─── */
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState(DEFAULT_PRODUCTS.slice(0, 6))
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.allSettled([
          productAPI.getAll({ limit: 6 }),
          categoryAPI.getAll()
        ])
        if (productsRes.status === 'fulfilled') {
          const pData = productsRes.value.data
          const list = pData?.content || pData || []
          if (Array.isArray(list) && list.length > 0) {
            setFeaturedProducts(list.slice(0, 6))
          }
        }

        if (categoriesRes.status === 'fulfilled') {
          const cData = categoriesRes.value.data
          if (Array.isArray(cData) && cData.length > 0) {
            setCategories(cData)
          }
        }
      } catch (error) {
        console.warn('Dùng dữ liệu danh mục & sản phẩm nổi bật mặc định:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* 1. Hero Animated Product Slider Section */}
      <HeroSlider />

      {/* 2. Flash Sale Section with Live Countdown */}
      <FlashSaleBanner />

      {/* 3. Categories Section */}
      {categories.length > 0 && (
        <section className="py-5">
          <div className="container">
            <h2 className="text-center mb-4 fw-bold">Danh Mục Sản Phẩm</h2>
            <div className="row g-3">
              {categories.map((category) => (
                <div key={category.id} className="col-md-6 col-lg-3">
                  <Link
                    to={`/products?category=${category.id}`}
                    className="card text-decoration-none text-dark h-100 rounded-4 shadow-sm border-0"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    <div className="card-body text-center p-4">
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{ width: 68, height: 68, background: '#fee2e2' }}
                      >
                        <i className="bi bi-box-seam fs-2 text-danger"></i>
                      </div>
                      <h5 className="fw-bold mb-1">{category.name}</h5>
                      <p className="text-muted small mb-0">{category.description || 'Khám phá ngay'}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Products Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="mb-1 fw-bold">Sản Phẩm Nổi Bật</h2>
              <p className="text-muted mb-0">Tuyển tập đồ bếp cao cấp được ưa chuộng nhất</p>
            </div>
            <Link to="/products" className="btn btn-outline-danger rounded-pill px-4 fw-semibold">
              Xem Tất Cả <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status"></div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Features Trust Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-white shadow-sm h-100">
                <i className="bi bi-truck fs-1 text-danger"></i>
                <h5 className="mt-3 fw-bold">Giao Hàng Nhanh</h5>
                <p className="text-muted small mb-0">Miễn phí vận chuyển cho đơn hàng trên 500.000đ</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-white shadow-sm h-100">
                <i className="bi bi-shield-check fs-1 text-danger"></i>
                <h5 className="mt-3 fw-bold">Chất Lượng Đảm Bảo</h5>
                <p className="text-muted small mb-0">100% sản phẩm chính hãng, bảo hành 24 tháng</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-white shadow-sm h-100">
                <i className="bi bi-headset fs-1 text-danger"></i>
                <h5 className="mt-3 fw-bold">Hỗ Trợ 24/7</h5>
                <p className="text-muted small mb-0">Đội ngũ tư vấn đầu bếp chuyên nghiệp, nhiệt tình</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
