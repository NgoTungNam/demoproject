import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

const Products = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
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
        // Fallback data for demo
        setProducts([
          { id: 1, name: 'Bộ dao bếp cao cấp Boker', price: 2500000, imageUrl: '/images/products/dao.jpg', description: 'Bộ dao bếp cao cấp Boker với 5 dao và dụng cụ, chất liệu thép không gỉ, tay cầm chắc chắn, phù hợp cho mọi công việc trong bếp' },
          { id: 2, name: 'Nồi hấp inox đa năng', price: 1200000, imageUrl: '/images/products/noiinox.jpg', description: 'Nồi hấp đa tầng bằng inox 304 cao cấp, thiết kế nhiều tầng tiện lợi, tay cầm chắc chắn, an toàn sức khỏe, phù hợp cho mọi loại bếp' },
          { id: 3, name: 'Chảo chống dính', price: 300000, imageUrl: '/images/products/chao.jpg', description: 'Chảo chống dính không độc hại, an toàn cho sức khỏe' },
        ])
        // setProducts([])
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

