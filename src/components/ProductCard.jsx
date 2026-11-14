import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { API_BASE_URL } from '../services/api'

const StarRating = ({ rating, count }) => {
  const stars = []
  const fullStars = Math.floor(rating || 0)
  const hasHalf = (rating || 0) - fullStars >= 0.5
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) stars.push(<i key={i} className="bi bi-star-fill text-warning" style={{ fontSize: '0.75rem' }}></i>)
    else if (i === fullStars + 1 && hasHalf) stars.push(<i key={i} className="bi bi-star-half text-warning" style={{ fontSize: '0.75rem' }}></i>)
    else stars.push(<i key={i} className="bi bi-star text-warning" style={{ fontSize: '0.75rem' }}></i>)
  }
  return (
    <span className="d-flex align-items-center gap-1">
      {stars}
      {count > 0 && <span style={{ fontSize: '0.7rem', color: '#888' }}>({count})</span>}
    </span>
  )
}

const CardCountdown = ({ endTime }) => {
  const [remaining, setRemaining] = useState(0)
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, new Date(endTime).getTime() - Date.now()))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [endTime])
  if (!remaining) return null
  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return <span className="badge bg-dark bg-opacity-75" aria-label="Thời gian còn lại của Flash Sale">
    Còn {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
  </span>
}

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()

  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1584346133934-a3afd2a33832?w=400&q=80&auto=format&fit=crop'
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return url
    return `${API_BASE_URL}/${url}`
  }

  const imageUrl = getImageUrl(product.imageUrl || product.image_url)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)

  const currentPrice = product.current_price ?? product.price
  const originalPrice = product.original_price ?? product.price
  const discountPercent = product.discount_percent || 0
  const hasDiscount = discountPercent > 0 && originalPrice > currentPrice
  const hasFlash = product.has_flash_sale

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100" style={{
        border: hasFlash ? '2px solid #d32f2f' : '1px solid #e0e0e0',
        borderRadius: 12, overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s'
      }}>
        <Link to={`/products/${product.id}`} className="text-decoration-none">
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src={imageUrl}
              className="card-img-top product-image"
              alt={product.name}
              style={{ height: 200, objectFit: 'cover' }}
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/noiinox.jpg' }}
            />
            {hasFlash && (
              <span style={{
                position: 'absolute', top: 10, left: 10,
                background: 'linear-gradient(135deg,#d32f2f,#b71c1c)',
                color: '#fff', padding: '3px 10px', borderRadius: 20,
                fontSize: '0.78rem', fontWeight: 700
              }}>⚡ FLASH SALE</span>
            )}
            {hasFlash && product.flash_end_time && (
              <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                <CardCountdown endTime={product.flash_end_time} />
              </div>
            )}
            {hasDiscount && !hasFlash && (
              <span style={{
                position: 'absolute', top: 10, left: 10, background: '#c62828',
                color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700
              }}>-{discountPercent}%</span>
            )}
          </div>
          <div className="card-body d-flex flex-column" style={{ padding: '12px 14px' }}>
            <h5 className="card-title text-dark mb-1" style={{ fontSize: '0.95rem', lineHeight: 1.4, minHeight: 42 }}>
              {product.name}
            </h5>
            {(product.rating_average > 0 || product.review_count > 0) && (
              <div className="mb-1">
                <StarRating rating={product.rating_average} count={product.review_count} />
              </div>
            )}
            <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.8rem' }}>
              {product.description?.substring(0, 75)}...
            </p>
            <div className="d-flex justify-content-between align-items-center mt-auto">
              <div>
                <div className="fw-bold" style={{ fontSize: '1.05rem', color: hasFlash ? '#c62828' : '#d32f2f' }}>
                  {formatPrice(currentPrice)}
                </div>
                {hasDiscount && (
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '0.82rem' }}>
                      {formatPrice(originalPrice)}
                    </span>
                    <span style={{ background: '#fff3cd', color: '#856404', fontSize: '0.72rem', fontWeight: 700, padding: '1px 6px', borderRadius: 8 }}>
                      -{discountPercent}%
                    </span>
                  </div>
                )}
              </div>
              <button
                className="btn btn-sm"
                onClick={handleAddToCart}
                style={{
                  background: hasFlash ? 'linear-gradient(135deg,#d32f2f,#b71c1c)' : 'linear-gradient(135deg,#d32f2f,#b71c1c)',
                  color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontWeight: 600
                }}
              >
                <i className="bi bi-cart-plus"></i> Thêm
              </button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default ProductCard

