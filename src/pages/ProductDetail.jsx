import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI } from '../services/api'
import { useCart } from '../context/CartContext'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productAPI.getById(id)
        setProduct(res.data)
      } catch (error) {
        console.error('Error fetching product:', error)
        // Fallback data with local sample images
        const sampleProducts = {
          '1': { name: 'Dao Bếp Chef', image: '/images/products/dao.jpg', price: 320000, description: 'Dao bếp chuyên nghiệp, lưỡi thép không gỉ' },
          '2': { name: 'Nồi Inox Cao Cấp', image: '/images/products/noiinox.jpg', price: 450000, description: 'Nồi inox 304 cao cấp, thích hợp cho mọi loại bếp' },
          '3': { name: 'Chảo Chống Dính', image: '/images/products/chao.jpg', price: 280000, description: 'Chảo chống dính lớp phủ ceramic an toàn' },
          '4': { name: 'Bộ Thìa Inox', image: '/images/products/thia.jpg', price: 85000, description: 'Bộ thìa inox cao cấp, sáng bóng' }
        }
        const sample = sampleProducts[id] || { name: 'Sản phẩm mẫu', image: '/images/products/noiinox.jpg', price: 500000, description: 'Sản phẩm chất lượng cao từ EuroAsia' }
        setProduct({
          id: id,
          name: sample.name,
          price: sample.price,
          description: sample.description,
          imageUrl: sample.image,
          stock: 10
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    addToCart(product, quantity)
    navigate('/cart')
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Không tìm thấy sản phẩm</div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm overflow-hidden bg-white">
            <img
              src={product.imageUrl || '/images/products/noiinox.jpg'}
              className="w-100"
              alt={product.name}
              style={{ objectFit: 'contain', height: '350px', backgroundColor: '#fff' }}
              onError={(e) => {
                e.target.src = '/images/products/noiinox.jpg'
              }}
            />
          </div>
        </div>
        <div className="col-md-6">
          <h1 className="mb-3">{product.name}</h1>
          <div className="mb-3">
            <span className="text-primary fs-3 fw-bold">
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="mb-4">
            <h5>Mô Tả Sản Phẩm</h5>
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
            <label className="form-label">Số lượng:</label>
            <div className="input-group" style={{ width: '150px' }}>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                type="number"
                className="form-control text-center"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product.stock || 10}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="d-grid gap-2">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <i className="bi bi-cart-plus"></i> Thêm Vào Giỏ Hàng
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate('/products')}
            >
              <i className="bi bi-arrow-left"></i> Quay Lại
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

