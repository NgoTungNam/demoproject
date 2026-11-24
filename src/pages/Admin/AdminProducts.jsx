import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, productAPI, categoryAPI } from '../../services/api';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../../data/mockProducts';

const fallbackImage = '/images/products/chao.jpg';

const getImageUrl = (imageUrl) => {
    if (!imageUrl) return `${API_BASE_URL}${fallbackImage}`;
    return imageUrl.startsWith('http') || imageUrl.startsWith('/') ? imageUrl : `${API_BASE_URL}/${imageUrl}`;
};

const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const AdminProducts = () => {
    const [products, setProducts] = useState(DEFAULT_PRODUCTS);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Quick Edit Modal state
    const [editModal, setEditModal] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        price: '',
        original_price: '',
        stock: 0,
        category_id: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const [pRes, cRes] = await Promise.all([
                productAPI.getAll(),
                categoryAPI.getAll().catch(() => ({ data: [] }))
            ]);
            if (pRes.data && Array.isArray(pRes.data) && pRes.data.length > 0) {
                setProducts(pRes.data);
            }
            if (cRes.data && Array.isArray(cRes.data) && cRes.data.length > 0) {
                setCategories(cRes.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setProducts(DEFAULT_PRODUCTS);
            setCategories(DEFAULT_CATEGORIES);
            setErrorMsg(
                window.location.protocol === 'https:' && API_BASE_URL.startsWith('http:')
                    ? `Lỗi Mixed Content: Trang web chạy HTTPS không thể kết nối tới Backend HTTP (${API_BASE_URL}). Vui lòng cập nhật URL Backend hỗ trợ HTTPS trong cấu hình deploy.`
                    : `Không thể kết nối đến máy chủ API (${API_BASE_URL || 'cục bộ'}). Vui lòng kiểm tra backend server đang chạy.`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi cơ sở dữ liệu?`)) return;
        try {
            await productAPI.delete(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            alert('✅ Đã xóa sản phẩm thành công!');
        } catch (error) {
            console.error('Lỗi xóa sản phẩm:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || error.message;
            alert('❌ Không thể xóa sản phẩm: ' + msg);
        }
    };

    const openEdit = (product) => {
        setEditModal(product);
        setEditForm({
            name: product.name || '',
            price: product.price || '',
            original_price: product.original_price || '',
            stock: product.stock !== undefined ? product.stock : 0,
            category_id: product.category_id || (categories[0]?.id || ''),
            description: product.description || ''
        });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editModal) return;
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('price', editForm.price);
            formData.append('original_price', editForm.original_price || '');
            formData.append('stock', editForm.stock);
            formData.append('category_id', editForm.category_id || '');
            formData.append('description', editForm.description || '');

            await productAPI.update(editModal.id, formData);
            alert('✅ Cập nhật sản phẩm thành công!');
            setEditModal(null);
            fetchData();
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || error.message;
            alert('❌ Cập nhật thất bại: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    const filtered = products.filter(p => {
        const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCategory === 'all' || String(p.category_id) === String(filterCategory);
        return matchSearch && matchCat;
    });

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>🍳 Quản Lý Sản Phẩm</h2>
                    <p className="text-muted mb-0">Quản lý kho hàng, giá niêm yết và chi tiết sản phẩm</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/product/new" className="btn btn-primary px-3 rounded-3">
                        <i className="bi bi-plus-lg me-2"></i>Thêm Sản Phẩm Mới
                    </Link>
                </div>
            </div>

            {/* Filter toolbar */}
            {errorMsg && (
                <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
                    <div>{errorMsg}</div>
                </div>
            )}
            <div className="card shadow-sm border-0 mb-4 rounded-3">
                <div className="card-body p-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Tìm theo tên sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="all">Tất cả danh mục</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2 text-md-end text-muted small">
                            Tìm thấy: <strong>{filtered.length}</strong> sản phẩm
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Table */}
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Đang tải danh sách sản phẩm từ hệ thống...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                            Không tìm thấy sản phẩm nào phù hợp
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Ảnh</th>
                                        <th>Tên Sản Phẩm</th>
                                        <th>Danh Mục</th>
                                        <th>Giá Bán</th>
                                        <th>Giá Gốc</th>
                                        <th>Tồn Kho</th>
                                        <th className="text-end pe-4">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((product) => (
                                        <tr key={product.id}>
                                            <td className="ps-4">
                                                <img 
                                                    src={getImageUrl(product.image_url)}
                                                    alt={product.name}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = fallbackImage;
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <div className="fw-bold text-dark">{product.name}</div>
                                                <div className="text-muted small text-truncate" style={{ maxWidth: '250px' }}>
                                                    {product.description || 'Chưa có mô tả'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-secondary border">
                                                    {product.category_name || 'Khác'}
                                                </span>
                                            </td>
                                            <td className="text-danger fw-bold">
                                                {formatPrice(product.price)}
                                            </td>
                                            <td className="text-muted small">
                                                {product.original_price ? formatPrice(product.original_price) : '—'}
                                            </td>
                                            <td>
                                                <span className={`badge ${product.stock > 0 ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}`}>
                                                    {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2 rounded-3"
                                                    onClick={() => openEdit(product)}
                                                    title="Sửa nhanh"
                                                >
                                                    <i className="bi bi-pencil me-1"></i>Sửa
                                                </button>
                                                <Link
                                                    to={`/admin/product/edit/${product.id}`}
                                                    className="btn btn-sm btn-outline-secondary me-2 rounded-3"
                                                    title="Trang chỉnh sửa chi tiết"
                                                >
                                                    <i className="bi bi-gear"></i>
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-3"
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    title="Xóa sản phẩm"
                                                >
                                                    <i className="bi bi-trash me-1"></i>Xóa
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

            {/* Quick Edit Modal */}
            {editModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header border-bottom py-3">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-pencil-square text-primary me-2"></i>
                                    Chỉnh Sửa Sản Phẩm #{editModal.id}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setEditModal(null)}></button>
                            </div>
                            <form onSubmit={handleSaveEdit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Tên sản phẩm *</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            required
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">Giá bán (VND) *</label>
                                            <input
                                                type="number"
                                                className="form-control rounded-3 text-danger fw-bold"
                                                required
                                                min="1"
                                                value={editForm.price}
                                                onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">Giá gốc (gạch ngang)</label>
                                            <input
                                                type="number"
                                                className="form-control rounded-3 text-muted"
                                                min="0"
                                                placeholder="Bỏ trống nếu không có"
                                                value={editForm.original_price}
                                                onChange={e => setEditForm({ ...editForm, original_price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">Tồn kho</label>
                                            <input
                                                type="number"
                                                className="form-control rounded-3"
                                                min="0"
                                                value={editForm.stock}
                                                onChange={e => setEditForm({ ...editForm, stock: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">Danh mục</label>
                                            <select
                                                className="form-select rounded-3"
                                                value={editForm.category_id}
                                                onChange={e => setEditForm({ ...editForm, category_id: e.target.value })}
                                            >
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Mô tả sản phẩm</label>
                                        <textarea
                                            className="form-control rounded-3"
                                            rows="3"
                                            value={editForm.description}
                                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top py-2">
                                    <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setEditModal(null)}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                                        {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</> : 'Lưu Thay Đổi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
