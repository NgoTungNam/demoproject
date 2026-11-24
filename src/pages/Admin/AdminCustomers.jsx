import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_CUSTOMERS } from '../../data/mockProducts';

const AdminCustomers = () => {
    const { user: currentUser } = useAuth();
    const [customers, setCustomers] = useState(DEFAULT_CUSTOMERS);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [formData, setFormData] = useState({ id: null, name: '', email: '', role: 'customer' });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setCustomers(res.data);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.warn('Lỗi tải khách hàng từ API, dùng dữ liệu mặc định:', error);
        } finally {
            setLoading(false);
        }
        const localCust = JSON.parse(localStorage.getItem('admin_customers') || 'null');
        setCustomers(localCust || DEFAULT_CUSTOMERS);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleEdit = (customer) => {
        setFormData({ ...customer });
        setShowModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget.id);
        try {
            await api.delete(`/users/${deleteTarget.id}`);
        } catch (error) {
            console.warn('Xoá khách hàng trên API thất bại, xoá cục bộ:', error);
        }
        setCustomers(prev => {
            const updated = prev.filter(c => c.id !== deleteTarget.id);
            localStorage.setItem('admin_customers', JSON.stringify(updated));
            return updated;
        });
        setDeleteTarget(null);
        setDeletingId(null);
        alert('Đã xoá người dùng thành công.');
    };

    const handleSave = async () => {
        try {
            await api.put(`/users/${formData.id}`, { name: formData.name, role: formData.role });
        } catch (error) {
            console.warn('Cập nhật khách hàng trên API thất bại, lưu cục bộ:', error);
        }
        setCustomers(prev => {
            const updated = prev.map(c => c.id === formData.id ? { ...c, name: formData.name, role: formData.role } : c);
            localStorage.setItem('admin_customers', JSON.stringify(updated));
            return updated;
        });
        setShowModal(false);
        alert('Cập nhật người dùng thành công!');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>👥 Quản Lý Khách Hàng</h2>
                    <p className="text-muted mb-0">Danh sách khách hàng và người dùng hệ thống</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <button
                        className="btn btn-sm btn-outline-primary rounded-3 px-3 fw-semibold"
                        onClick={fetchCustomers}
                        disabled={loading}
                    >
                        🔄 Làm mới
                    </button>
                    <div className="badge bg-danger fs-6 px-3 py-2">
                        Tổng: {customers.length} khách hàng
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4 py-3">Mã KH</th>
                                    <th className="py-3">Họ và Tên</th>
                                    <th className="py-3">Email</th>
                                    <th className="py-3">Số Điện Thoại</th>
                                    <th className="py-3">Vai Trò</th>
                                    <th className="py-3">Ngày Tham Gia</th>
                                    <th className="py-3 text-end px-4">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">
                                            ⏳ Đang tải dữ liệu khách hàng...
                                        </td>
                                    </tr>
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">
                                            Chưa có dữ liệu khách hàng
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => {
                                        const isSelf = currentUser && currentUser.id === customer.id;
                                        const isDeleting = deletingId === customer.id;
                                        return (
                                            <tr key={customer.id}>
                                                <td className="px-4 fw-bold text-secondary">
                                                    #{customer.id}
                                                </td>
                                                <td className="fw-semibold text-dark">
                                                    {customer.name} {isSelf && <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.7rem' }}>Bạn</span>}
                                                </td>
                                                <td className="text-muted">{customer.email || '—'}</td>
                                                <td className="text-muted">{customer.phone || '—'}</td>
                                                <td>
                                                    <span className={`badge ${customer.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                        {customer.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                                    </span>
                                                </td>
                                                <td className="text-muted">{formatDate(customer.joinDate)}</td>
                                                <td className="text-end px-4">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary me-2 rounded-3"
                                                        onClick={() => handleEdit(customer)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        ✏️ Sửa
                                                    </button>
                                                    {isSelf ? (
                                                        <button
                                                            className="btn btn-sm btn-light border text-muted rounded-3"
                                                            onClick={() => alert(`Tài khoản "${customer.name}" (#${customer.id}) là tài khoản bạn đang đăng nhập!\n\nHệ thống khóa quyền tự xóa để bảo vệ phiên đăng nhập quản trị viên của bạn.`)}
                                                            title="Nhấn để xem thông tin"
                                                        >
                                                            🔒 Đang dùng
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger rounded-3"
                                                            onClick={() => setDeleteTarget(customer)}
                                                            disabled={deletingId === customer.id}
                                                            title="Xoá khách hàng"
                                                        >
                                                            {deletingId === customer.id ? '⏳' : '🗑️'} Xoá
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Xác Nhận Xóa */}
            {deleteTarget && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-body p-4 text-center">
                                <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
                                <h5 className="fw-bold text-danger mb-2">Xác nhận xoá người dùng</h5>
                                <p className="text-muted mb-3" style={{ fontSize: '0.92rem' }}>
                                    Bạn có chắc chắn muốn xoá tài khoản <strong>{deleteTarget.name || deleteTarget.email}</strong> (Mã KH: #{deleteTarget.id})?
                                </p>
                                <div className="alert alert-warning py-2 px-3 text-start mb-4" style={{ fontSize: '0.8rem' }}>
                                    ⚠️ Tài khoản này sẽ bị xoá khỏi hệ thống. Lịch sử đơn hàng trước đây vẫn được giữ nguyên an toàn.
                                </div>
                                <div className="d-flex justify-content-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-light px-4 py-2 rounded-3 fw-semibold"
                                        onClick={() => setDeleteTarget(null)}
                                        disabled={Boolean(deletingId)}
                                    >
                                        Huỷ bỏ
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger px-4 py-2 rounded-3 fw-semibold"
                                        onClick={handleConfirmDelete}
                                        disabled={Boolean(deletingId)}
                                    >
                                        {deletingId ? '⏳ Đang xoá...' : 'Đồng ý xoá'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Chỉnh Sửa Khách Hàng</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Họ và Tên</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Email</label>
                                    <input
                                        type="email"
                                        className="form-control rounded-3"
                                        value={formData.email}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Vai Trò</label>
                                    <select
                                        className="form-select rounded-3"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="customer">Khách hàng (Customer)</option>
                                        <option value="admin">Quản trị viên (Admin)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-light rounded-3" onClick={() => setShowModal(false)}>
                                    Huỷ
                                </button>
                                <button type="button" className="btn btn-primary rounded-3" onClick={handleSave}>
                                    Lưu Thay Đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
