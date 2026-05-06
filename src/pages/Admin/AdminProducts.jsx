import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { productAPI } from '../../services/api';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await productAPI.getAll();
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                // Giả định có API delete hoặc báo lỗi
                alert('Chức năng xóa đang được cập nhật');
            } catch (error) {
                alert('Lỗi khi xóa');
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Products</h2>
                {/* Reuse existing ProductCreate page but assume we need a link */}
                <Link to="/product/new" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i> Add Product
                </Link>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Đang tải danh sách sản phẩm...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Ảnh</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Giá</th>
                                        <th>Mô tả</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <img 
                                                    src={product.image_url?.startsWith('http') ? product.image_url : `http://localhost:8080${product.image_url}`} 
                                                    alt={product.name} 
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                                                />
                                            </td>
                                            <td className="fw-bold">{product.name}</td>
                                            <td className="text-danger fw-bold">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                            </td>
                                            <td className="text-muted" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {product.description}
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary me-2">
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product.id)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
