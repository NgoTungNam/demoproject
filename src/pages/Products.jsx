import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API_BASE_URL, productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

const Products = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setErrorMsg(null)
      try {
        let productsRes
        if (searchKeyword) {
          productsRes = await productAPI.search(searchKeyword)
        } else if (selectedCategory) {
          productsRes = await productAPI.getByCategory(selectedCategory)
        } else {
          productsRes = await productAPI.getAll()
        }
        setProducts(productsRes.data.content || productsRes.data || [])

        const categoriesRes = await categoryAPI.getAll()
        setCategories(categoriesRes.data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setErrorMsg(
          window.location.protocol === 'https:' && API_BASE_URL.startsWith('http:')
            ? `Lỗi Mixed Content: Trang web chạy HTTPS không thể kết nối tới Backend HTTP (${API_BASE_URL}). Vui lòng cập nhật URL Backend hỗ trợ HTTPS trong cấu hình deploy.`
            : `Không thể kết nối đến máy chủ API (${API_BASE_URL || 'cục bộ'}). Vui lòng kiểm tra backend server đang chạy.`
        )
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCategory, searchKeyword])

  return (
    <div className="container py-4">
      <div className="row">
        {/* Sidebar Filters */}
        <div className="col-md-3 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Danh Mục</h5>
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${!selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                Tất Cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`list-group-item list-group-item-action ${selectedCategory == category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-md-9">
          {searchKeyword && (
            <div className="alert alert-info">
              Kết quả tìm kiếm cho: <strong>"{searchKeyword}"</strong>
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
              <div>{errorMsg}</div>
            </div>
          )}

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="mt-3 text-muted">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <div className="row">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products

