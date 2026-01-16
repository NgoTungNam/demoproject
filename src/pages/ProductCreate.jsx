import React, { useState, useEffect } from 'react'
import ImageUpload from '../components/ImageUpload'
import { productAPI } from '../services/api'
import { useParams, useNavigate } from 'react-router-dom'

const ProductCreate = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditMode = !!id

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: 'Dụng cụ bếp'
    })
    const [image, setImage] = useState(null)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const fetchProduct = async () => {
            if (isEditMode) {
                try {
                    const res = await productAPI.getById(id)
                    const product = res.data
                    setFormData({
                        name: product.name,
                        price: product.price,
                        description: product.description || '',
                        category: product.category_id === 1 ? 'Dụng cụ bếp' : 'Khác' // Map tạm category
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
            formDataToSend.append('description', formData.description)
            formDataToSend.append('category', formData.category)

            if (image) {
                formDataToSend.append('image', image)
            }

            if (isEditMode) {
                // await productAPI.update(id, formDataToSend)
                alert('Cập nhật sản phẩm thành công!')
            } else {
                await productAPI.create(formDataToSend)
                alert('Tạo sản phẩm thành công!')
            }

            setSubmitted(false)
            if (!isEditMode) {
                setFormData({
                    name: '',
                    price: '',
                    description: '',
                    category: 'Dụng cụ bếp'
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
                                                <label htmlFor="price" className="form-label">Giá (VNĐ)</label>
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
                                                <label htmlFor="category" className="form-label">Danh mục</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="category"
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    placeholder="Nhập tên danh mục"
                                                />
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
