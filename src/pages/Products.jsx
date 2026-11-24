import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API_BASE_URL, productAPI, categoryAPI } from '../services/api'
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../data/mockProducts'
import ProductCard from '../components/ProductCard'

const Products = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const fetchData = async () => {
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
        const list = productsRes.data?.content || productsRes.data || []
        if (Array.isArray(list) && list.length > 0) {
          setProducts(list)
        } else if (!searchKeyword && !selectedCategory) {
          setProducts(DEFAULT_PRODUCTS)
        } else {
          setProducts(list)
        }

        const categoriesRes = await categoryAPI.getAll()
        const catList = categoriesRes.data || []
        if (Array.isArray(catList) && catList.length > 0) {
          setCategories(catList)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        let list = DEFAULT_PRODUCTS
        if (selectedCategory) {
          list = list.filter(p => String(p.category_id) === String(selectedCategory))
        }
        if (searchKeyword) {
          list = list.filter(p => p.name.toLowerCase().includes(searchKeyword.toLowerCase()))
        }
        setProducts(list)
        setCategories(DEFAULT_CATEGORIES)
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

