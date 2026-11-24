import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import { DEFAULT_CATEGORIES } from '../../data/mockProducts';

const AdminCategories = () => {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await categoryAPI.getAll();
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setCategories(res.data);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.warn('Lỗi tải danh mục từ API, chuyển sang dữ liệu mặc định:', error);
        } finally {
            setLoading(false);
        }
        const localCats = JSON.parse(localStorage.getItem('admin_categories') || 'null');
        setCategories(localCats || DEFAULT_CATEGORIES);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEdit = (category) => {
        setFormData({ name: category.name || '', description: category.description || '' });
        setEditingId(category.id);
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"? Các sản phẩm thuộc danh mục này sẽ được chuyển về nhóm Khác.`)) return;
        try {
            await categoryAPI.delete(id);
        } catch (error) {
            console.warn('Xóa trên API không thành công, xóa cục bộ:', error);
        }
        setCategories(prev => {
            const updated = prev.filter(c => c.id !== id);
            localStorage.setItem('admin_categories', JSON.stringify(updated));
            return updated;
        });
        alert('✅ Đã xóa danh mục thành công!');
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!formData.name.trim()) {
            alert('Vui lòng nhập tên danh mục');
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await categoryAPI.update(editingId, formData);
            } else {
                await categoryAPI.create(formData);
            }
        } catch (error) {
            console.warn('Lưu trên API không thành công, cập nhật cục bộ:', error);
        }

        setCategories(prev => {
            let updated;
            if (editingId) {
                updated = prev.map(c => c.id === editingId ? { ...c, ...formData } : c);
            } else {
                const newCat = { id: Date.now(), name: formData.name, description: formData.description };
                updated = [...prev, newCat];
            }
            localStorage.setItem('admin_categories', JSON.stringify(updated));
            return updated;
        });

        alert(editingId ? '✅ Đã cập nhật danh mục thành công!' : '✅ Đã thêm danh mục mới thành công!');
        setShowModal(false);
        setFormData({ name: '', description: '' });
        setEditingId(null);
        setSaving(false);
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>📂 Quản Lý Danh Mục</h2>
                    <p className="text-muted mb-0">Phân loại sản phẩm đồ bếp trên website</p>
                </div>
                <button
                    className="btn btn-primary px-3 rounded-3"
                    onClick={() => { setFormData({ name: '', description: '' }); setEditingId(null); setShowModal(true); }}
                >
                    <i className="bi bi-plus-lg me-2"></i>Thêm Danh Mục Mới
                </button>
            </div>

            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 text-muted">Đang tải danh mục...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            Chưa có danh mục nào được tạo
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Mã DM</th>
                                        <th>Tên Danh Mục</th>
                                        <th>Mô Tả</th>
                                        <th className="text-end pe-4">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id}>
                                            <td className="ps-4 fw-bold text-secondary">#{cat.id}</td>
                                            <td className="fw-bold text-dark">{cat.name}</td>
                                            <td className="text-muted">{cat.description || '—'}</td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2 rounded-3"
                                                    onClick={() => handleEdit(cat)}
                                                    title="Sửa danh mục"
                                                >
                                                    <i className="bi bi-pencil me-1"></i>Sửa
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-3"
                                                    onClick={() => handleDelete(cat.id, cat.name)}
                                                    title="Xóa danh mục"
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

            {/* Modal Create / Edit Category */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header border-bottom py-3">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-folder-plus text-primary me-2"></i>
                                    {editingId ? `Chỉnh Sửa Danh Mục #${editingId}` : 'Thêm Danh Mục Mới'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Tên danh mục *</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            placeholder="Ví dụ: Nồi chảo, Dao bếp, Dụng cụ bàn ăn..."
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Mô tả danh mục</label>
                                        <textarea
                                            className="form-control rounded-3"
                                            rows="3"
                                            placeholder="Mô tả tóm tắt cho nhóm sản phẩm này..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top py-2">
                                    <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                                        {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</> : (editingId ? 'Cập Nhật' : 'Tạo Danh Mục')}
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

export default AdminCategories;
