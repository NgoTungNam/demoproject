import React, { useState, useEffect } from 'react'
import ImageUpload from '../components/ImageUpload'
import { productAPI, categoryAPI } from '../services/api'
import { useParams, useNavigate } from 'react-router-dom'

const ProductCreate = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditMode = !!id

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        original_price: '',
        stock: 0,
        description: '',
        category_id: ''
    })
    const [categories, setCategories] = useState([])
    const [image, setImage] = useState(null)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        categoryAPI.getAll().then(({ data }) => setCategories(data)).catch(() => {})
        const fetchProduct = async () => {
            if (isEditMode) {
                try {
                    const res = await productAPI.getById(id)
                    const product = res.data
                    setFormData({
                        name: product.name,
                        price: product.price,
                        original_price: product.original_price || '',
                        stock: product.stock || 0,
                        description: product.description || '',
                        category_id: product.category_id || ''
                    })
                    // Note: Image handling logic might need adjustment if we want to show existing image preview
                } catch (error) {
                    console.error('Failed to fetch product for edit:', error)
                    alert('Không thể lấy thông tin sản phẩm!')
                }
            }
        }
        fetchProduct()
    }, [id, isEditMode])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleImageSelect = (file) => {
        setImage(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitted(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('name', formData.name)
            formDataToSend.append('price', formData.price)
            formDataToSend.append('original_price', formData.original_price)
            formDataToSend.append('stock', formData.stock)
            formDataToSend.append('description', formData.description)
            formDataToSend.append('category_id', formData.category_id)

            if (image) {
                formDataToSend.append('image', image)
            }

            if (isEditMode) {
                await productAPI.update(id, formDataToSend)
            } else {
                await productAPI.create(formDataToSend)
                alert('Tạo sản phẩm thành công!')
            }

            setSubmitted(false)
            if (!isEditMode) {
                setFormData({
                    name: '',
                    price: '',
                    original_price: '',
                    stock: 0,
                    description: '',
                    category_id: categories[0]?.id || ''
                })
                setImage(null)
            } else {
                navigate('/admin/products')
            }
        } catch (error) {
            console.error('Error saving product:', error)
            alert('Có lỗi xảy ra: ' + (error.response?.data?.message || 'Lỗi không xác định'))
            setSubmitted(false)
        }
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h4 className="card-title mb-0">{isEditMode ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row mb-3">
                                    <div className="col-md-8">
                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label">Tên sản phẩm</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nhập tên sản phẩm"
                                            />
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label htmlFor="price" className="form-label">Giá bán (VNĐ)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="price"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    required
                                                    min="0"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="original_price" className="form-label">Giá gốc (không bắt buộc)</label>
                                                <input type="number" className="form-control" id="original_price" name="original_price"
                                                    value={formData.original_price} onChange={handleChange} min={formData.price || 0} />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="stock" className="form-label">Tồn kho</label>
                                                <input type="number" className="form-control" id="stock" name="stock"
                                                    value={formData.stock} onChange={handleChange} min="0" step="1" required />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="category_id" className="form-label">Danh mục</label>
                                                <select className="form-select" id="category_id" name="category_id"
                                                    value={formData.category_id}
                                                    onChange={handleChange}
                                                    required>
                                                    <option value="">Chọn danh mục</option>
                                                    {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="description" className="form-label">Mô tả</label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                name="description"
                                                rows="4"
                                                value={formData.description}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        {/* Image Upload Component */}
                                        <ImageUpload onImageSelect={handleImageSelect} />
                                    </div>
                                </div>

                                <div className="d-grid gap-2 d-md-flex justify-content-md-end border-top pt-3">
                                    <button type="button" className="btn btn-outline-secondary me-md-2" onClick={() => navigate(-1)}>Hủy</button>
                                    <button type="submit" className="btn btn-primary px-4" disabled={submitted}>
                                        {submitted ? 'Đang xử lý...' : (isEditMode ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCreate
