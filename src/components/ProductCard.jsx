import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { API_BASE_URL } from '../services/api'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()

  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1584346133934-a3afd2a33832?w=400&q=80&auto=format&fit=crop'
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  }

  const imageUrl = getImageUrl(product.imageUrl || product.image_url)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100">
        <Link to={`/products/${product.id}`} className="text-decoration-none">
          <img
            src={imageUrl}
            className="card-img-top product-image"
            alt={product.name}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1584346133934-a3afd2a33832?w=400&q=80&auto=format&fit=crop'
            }}
          />
          <div className="card-body d-flex flex-column">
            <h5 className="card-title text-dark">{product.name}</h5>
            <p className="card-text text-muted flex-grow-1">
              {product.description?.substring(0, 100)}...
            </p>
            <div className="d-flex justify-content-between align-items-center mt-auto">
              <span className="text-primary fw-bold fs-5">
                {formatPrice(product.price)}
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddToCart}
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

