import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI, API_BASE_URL } from '../services/api'
import { DEFAULT_PRODUCTS } from '../data/mockProducts'
import { useCart } from '../context/CartContext'
import ReviewSection from '../components/ReviewSection'

/* ─── Helpers ─────────────────────────────────────────── */
const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0)
const getImg = (url, name = '') => {
  const n = (name || '').toLowerCase()
  if (n.includes('chiên') && (!url || url.includes('noiinox') || url.includes('chao'))) {
    return '/images/products/noichien.jpg'
  }
  if (n.includes('ép') && (!url || url.includes('noiinox') || url.includes('chao'))) {
    return '/images/products/mayep.webp'
  }
  if (!url) return '/images/products/noiinox.jpg'
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http') || url.startsWith('/')) return url
  return `${API_BASE_URL}/${url}`
}

/* ─── StarRating ──────────────────────────────────────── */
const StarRating = ({ rating, count, size = '1rem' }) => {
  const full = Math.floor(rating || 0)
  const half = (rating || 0) - full >= 0.5
  return (
    <span className="d-flex align-items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <i key={i} className={`bi ${i <= full ? 'bi-star-fill' : (i === full+1 && half ? 'bi-star-half' : 'bi-star')} text-warning`}
           style={{ fontSize: size }}></i>
      ))}
      {count > 0 && <span className="text-muted ms-1" style={{ fontSize: '0.85rem' }}>({count} đánh giá)</span>}
    </span>
  )
}

/* ─── InteractiveStar ─────────────────────────────────── */
const InteractiveStar = ({ value, onChange }) => (
  <div className="d-flex gap-1 mb-2">
    {[1,2,3,4,5].map(i => (
      <i key={i}
         className={`bi ${i <= value ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}
         style={{ fontSize: '1.5rem', cursor: 'pointer' }}
         onClick={() => onChange(i)}></i>
    ))}
    <span className="ms-2 text-muted align-self-center">
      {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'][value] || 'Chọn sao'}
    </span>
  </div>
)

/* ─── FlashCountdown ──────────────────────────────────── */
const FlashCountdown = ({ endTime }) => {
  const [remaining, setRemaining] = useState(0)
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, new Date(endTime) - new Date()))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [endTime])

  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  const pad = (n) => String(n).padStart(2, '0')
  if (remaining <= 0) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg,#d32f2f,#b71c1c)',
      color: '#fff', padding: '8px 16px', borderRadius: 10,
      display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12
    }}>
      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>⚡ FLASH SALE kết thúc sau:</span>
      {[pad(h)+'h', pad(m)+'m', pad(s)+'s'].map((t, i) => (
        <span key={i} style={{
          background: 'rgba(0,0,0,0.25)', borderRadius: 6,
          padding: '2px 8px', fontWeight: 900, fontFamily: 'monospace', fontSize: '1.1rem'
        }}>{t}</span>
      ))}
    </div>
  )
}

/* ─── ReviewList ──────────────────────────────────────── */
const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productAPI.getById(id)
        if (res.data && res.data.id) {
          setProduct(res.data)
        } else {
          const fallback = DEFAULT_PRODUCTS.find(p => String(p.id) === String(id)) || DEFAULT_PRODUCTS[0]
          setProduct(fallback)
        }
      } catch (error) {
        const fallback = DEFAULT_PRODUCTS.find(p => String(p.id) === String(id)) || DEFAULT_PRODUCTS[0]
        setProduct(fallback)
      } finally { setLoading(false) }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    addToCart({ ...product, price: product.current_price ?? product.price }, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary"></div>
    </div>
  )

  if (!product) return (
    <div className="container py-5">
      <div className="alert alert-danger">Không tìm thấy sản phẩm</div>
    </div>
  )

  const currentPrice = product.current_price ?? product.price
  const originalPrice = product.original_price ?? product.price
  const discountPct = product.discount_percent || 0
  const hasDiscount = discountPct > 0 && originalPrice > currentPrice

  return (
    <div className="container py-5">
      <div className="row g-5">
        {/* Image */}
        <div className="col-md-5">
          <div className="card shadow-sm overflow-hidden bg-white" style={{ borderRadius: 16 }}>
            <img
              src={getImg(product.imageUrl || product.image_url, product.name)}
              className="w-100"
              alt={product.name}
              style={{ objectFit: 'contain', height: 380, backgroundColor: '#fff' }}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = product.name?.toLowerCase().includes('chiên') ? '/images/products/noichien.jpg' : '/images/products/noiinox.jpg'
              }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="col-md-7">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb" style={{ fontSize: '0.85rem' }}>
              <li className="breadcrumb-item"><a href="/products">Sản phẩm</a></li>
              {product.category_name && <li className="breadcrumb-item">{product.category_name}</li>}
              <li className="breadcrumb-item active">{product.name}</li>
            </ol>
          </nav>

          <h1 className="mb-2" style={{ fontSize: '1.6rem', fontWeight: 700 }}>{product.name}</h1>

          {/* Ratings summary */}
          {(product.rating_average > 0 || product.review_count > 0) && (
            <div className="mb-3">
              <StarRating rating={product.rating_average} count={product.review_count} />
            </div>
          )}

          {/* Flash sale countdown */}
          {product.has_flash_sale && product.flash_end_time && (
            <FlashCountdown endTime={product.flash_end_time} />
          )}

          {/* Pricing */}
          <div className="mb-4">
            <div style={{ fontSize: '2rem', fontWeight: 900, color: hasDiscount ? '#c62828' : '#d32f2f', lineHeight: 1.2 }}>
              {fmt(currentPrice)}
            </div>
            {hasDiscount && (
              <div className="d-flex align-items-center gap-3 mt-1">
                <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '1.1rem' }}>
                  {fmt(originalPrice)}
                </span>
                <span style={{ background: '#c62828', color: '#fff', padding: '3px 12px', borderRadius: 20, fontWeight: 700, fontSize: '0.9rem' }}>
                  -{discountPct}% Giảm giá
                </span>
                <span className="text-success fw-semibold" style={{ fontSize: '0.9rem' }}>
                  Tiết kiệm {fmt(originalPrice - currentPrice)}
                </span>
              </div>
            )}
            {product.has_flash_sale && product.flash_remaining !== null && (
              <div className="mt-2">
                <div className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.85rem', color: '#c62828' }}>
                  <i className="bi bi-fire"></i>
                  <span>Chỉ còn <strong>{product.flash_remaining}</strong> sản phẩm với giá này!</span>
                </div>
                <div style={{ background: '#eee', borderRadius: 6, height: 6, overflow: 'hidden', width: 200 }}>
                  <div style={{
                    width: `${Math.min(100, 100 - (product.flash_remaining / 50) * 100)}%`,
                    height: '100%', background: 'linear-gradient(90deg,#d32f2f,#b71c1c)'
                  }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-3">
            <h5 className="fw-semibold">Mô Tả Sản Phẩm</h5>
            <p className="text-muted">{product.description || 'Sản phẩm chất lượng cao từ EuroAsia'}</p>
          </div>

          {product.stock !== undefined && (
            <div className="mb-3">
              <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
              </span>
            </div>
          )}

          <div className="mb-4">
            <label className="form-label fw-semibold">Số lượng:</label>
            <div className="input-group" style={{ width: 150 }}>
              <button className="btn btn-outline-secondary"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <input type="number" className="form-control text-center" value={quantity} min={1} max={product.stock || 99}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
              <button className="btn btn-outline-secondary"
                onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}>+</button>
            </div>
          </div>

          <div className="d-grid gap-2">
            <button className="btn btn-lg" onClick={handleAddToCart} disabled={product.stock === 0}
              style={{
                background: product.has_flash_sale
                  ? 'linear-gradient(135deg,#d32f2f,#b71c1c)'
                  : 'linear-gradient(135deg,#d32f2f,#b71c1c)',
                color: '#fff', border: 'none', fontWeight: 700, borderRadius: 12, padding: '12px'
              }}>
              {added ? <><i className="bi bi-check-circle"></i> Đã thêm!</> : <><i className="bi bi-cart-plus"></i> Thêm Vào Giỏ Hàng</>}
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/products')}>
              <i className="bi bi-arrow-left"></i> Quay Lại
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={id} />
    </div>
  )
}

export default ProductDetail

