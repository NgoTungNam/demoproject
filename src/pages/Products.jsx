import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API_BASE_URL, productAPI, categoryAPI } from '../services/api'
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../data/mockProducts'
import ProductCard from '../components/ProductCard'

const Products = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '')

  // Merge local-only products (newly added via admin offline) vào danh sách API
  const mergeWithLocal = (apiList) => {
    const localRaw = JSON.parse(localStorage.getItem('admin_products') || 'null')
    if (!localRaw) return apiList
    // Lấy sản phẩm local có id dạng chuỗi "local_..." (thêm offline)
    const localOnly = localRaw.filter(p => String(p.id).startsWith('local_'))
    if (localOnly.length === 0) return apiList
    return [...apiList, ...localOnly]
  }

  const sanitizeImage = (p) => {
    const name = (p.name || '').toLowerCase()
    const url = p.image_url || p.imageUrl || ''
    if (name.includes('chiên') && (!url || url.includes('noiinox') || url.includes('chao') || url.startsWith('blob:'))) {
      return { ...p, image_url: '/images/products/noichien.jpg' }
    }
    if (name.includes('ép') && (!url || url.includes('noiinox') || url.includes('chao') || url.startsWith('blob:'))) {
      return { ...p, image_url: '/images/products/mayep.webp' }
    }
    return p
  }

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
        let list = productsRes.data?.content || productsRes.data || []
        list = Array.isArray(list) ? list : []
        // Nếu không tìm kiếm/lọc, merge thêm sản phẩm thêm offline
        if (!searchKeyword && !selectedCategory) {
          list = mergeWithLocal(list)
        }
        if (list.length === 0 && !searchKeyword && !selectedCategory) {
          list = DEFAULT_PRODUCTS
        }
        setProducts(list.map(sanitizeImage))

        const categoriesRes = await categoryAPI.getAll()
        const catList = categoriesRes.data || []
        if (Array.isArray(catList) && catList.length > 0) {
          setCategories(catList)
        }
      } catch (error) {
        console.warn('API không khả dụng, dùng dữ liệu lưu trữ:', error)
        // Fallback: dùng localStorage (đã có cả sản phẩm mới thêm offline)
        let localList = JSON.parse(localStorage.getItem('admin_products') || 'null')
        // Merge DEFAULT_PRODUCTS + local — tránh trùng id
        if (localList && localList.length > 0) {
          const localIds = new Set(localList.map(p => String(p.id)))
          const extras = DEFAULT_PRODUCTS.filter(p => !localIds.has(String(p.id)))
          localList = [...localList, ...extras]
        } else {
          localList = DEFAULT_PRODUCTS
        }
        let list = localList.map(sanitizeImage)
        if (selectedCategory) {
          list = list.filter(p => String(p.category_id) === String(selectedCategory))
        }
        if (searchKeyword) {
          list = list.filter(p => p.name.toLowerCase().includes(searchKeyword.toLowerCase()))
        }
        const catList = JSON.parse(localStorage.getItem('admin_categories') || 'null') || DEFAULT_CATEGORIES
        setProducts(list)
        setCategories(catList)
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
        <div className="col-lg-3 col-md-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fs-6 fw-bold">Danh Mục</h5>
            </div>
            {/* Horizontal scroll on mobile screens, list-group on desktop */}
            <div className="list-group list-group-flush d-none d-md-block">
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
            {/* Mobile horizontal category pills */}
            <div className="d-md-none p-2 d-flex gap-2 overflow-auto text-nowrap mobile-category-pills">
              <button
                className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ borderRadius: '20px' }}
                onClick={() => setSelectedCategory('')}
              >
                Tất Cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`btn btn-sm ${selectedCategory == category.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ borderRadius: '20px' }}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-lg-9 col-md-8">
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

