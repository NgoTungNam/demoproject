import React, { useState, useEffect } from 'react'
import ImageUpload from '../components/ImageUpload'
import { productAPI, categoryAPI } from '../services/api'
import { useParams, useNavigate } from 'react-router-dom'
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '../data/mockProducts'

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
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
    const [image, setImage] = useState(null)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryAPI.getAll()
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setCategories(res.data)
                    return
                }
            } catch (err) {
                console.warn('Lỗi tải danh mục từ API, dùng danh mục mặc định:', err)
            }
            const localCats = JSON.parse(localStorage.getItem('admin_categories') || 'null')
            setCategories(localCats || DEFAULT_CATEGORIES)
        }
        fetchCategories()

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
                } catch (error) {
                    console.warn('Không thể lấy thông tin sản phẩm từ API, tìm trong bộ nhớ cục bộ:', error)
                    const localProds = JSON.parse(localStorage.getItem('admin_products') || 'null') || DEFAULT_PRODUCTS
                    const found = localProds.find(p => String(p.id) === String(id))
                    if (found) {
                        setFormData({
                            name: found.name,
                            price: found.price,
                            original_price: found.original_price || '',
                            stock: found.stock || 0,
                            description: found.description || '',
                            category_id: found.category_id || ''
                        })
                    }
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

    const fileToBase64 = (file) => new Promise((resolve) => {
        if (!file) return resolve(null)
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitted(true)

        let base64Image = null
        if (image && typeof image === 'object') {
            base64Image = await fileToBase64(image)
        }

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
            }
            alert(isEditMode ? '✅ Cập nhật sản phẩm thành công!' : '✅ Tạo sản phẩm thành công!')
        } catch (error) {
            console.warn('API không khả dụng, lưu sản phẩm vào bộ nhớ cục bộ:', error)
            try {
                const localProds = JSON.parse(localStorage.getItem('admin_products') || 'null') || [...DEFAULT_PRODUCTS]
                const catObj = categories.find(c => String(c.id) === String(formData.category_id))
                
                // Sử dụng chính xác ảnh người dùng tải lên dạng Base64
                let finalImageUrl = base64Image
                if (!finalImageUrl) {
                    if (formData.name.toLowerCase().includes('chiên')) {
                        finalImageUrl = '/images/products/noichien.jpg'
                    } else {
                        finalImageUrl = '/images/products/chao.jpg'
                    }
                }

                if (isEditMode) {
                    const updated = localProds.map(p => String(p.id) === String(id) ? {
                        ...p,
                        name: formData.name,
                        price: Number(formData.price),
                        original_price: Number(formData.original_price) || Number(formData.price),
                        stock: Number(formData.stock),
                        description: formData.description,
                        category_id: Number(formData.category_id),
                        category_name: catObj?.name || 'Khác',
                        image_url: finalImageUrl || p.image_url
                    } : p)
                    localStorage.setItem('admin_products', JSON.stringify(updated))
                } else {
                    const newProd = {
                        id: `local_${Date.now()}`,
                        name: formData.name,
                        price: Number(formData.price),
                        original_price: Number(formData.original_price) || Number(formData.price),
                        current_price: Number(formData.price),
                        discount_percent: formData.original_price && Number(formData.original_price) > Number(formData.price)
                            ? Math.round((Number(formData.original_price) - Number(formData.price)) / Number(formData.original_price) * 100)
                            : 0,
                        stock: Number(formData.stock),
                        description: formData.description,
                        category_id: Number(formData.category_id),
                        category_name: catObj?.name || 'Khác',
                        rating_average: 5.0,
                        review_count: 0,
                        image_url: finalImageUrl,
                        is_active: 1
                    }
                    localProds.unshift(newProd)
                    localStorage.setItem('admin_products', JSON.stringify(localProds))
                }
                alert(isEditMode ? '✅ Cập nhật sản phẩm thành công!' : '✅ Tạo sản phẩm thành công!')
            } catch (storageErr) {
                console.error('Lỗi lưu sản phẩm cục bộ:', storageErr)
            }
        } finally {
            setSubmitted(false)
            navigate('/admin/products')
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
