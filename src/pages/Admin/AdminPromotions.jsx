import React, { useState } from 'react';

const AdminPromotions = () => {
    const [promotions, setPromotions] = useState([
        { id: 1, code: 'WELCOME10', discount: 10, type: 'Percentage', status: 'Active' },
        { id: 2, code: 'SUMMER20', discount: 20, type: 'Percentage', status: 'Expired' },
        { id: 3, code: 'FREESHIP', discount: 0, type: 'Free Shipping', status: 'Active' },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, code: '', discount: 0, type: 'Percentage', status: 'Active' });

    const handleSave = () => {
        if (formData.id) {
            setPromotions(promotions.map(p => p.id === formData.id ? { ...formData } : p));
        } else {
            setPromotions([...promotions, { ...formData, id: Date.now() }]);
        }
        setShowModal(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({ id: null, code: '', discount: 0, type: 'Percentage', status: 'Active' });
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure?')) {
            setPromotions(promotions.filter(p => p.id !== id));
        }
    };

    const handleEdit = (promo) => {
        setFormData(promo);
        setShowModal(true);
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Promotions</h2>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <i className="bi bi-plus-lg me-2"></i> Add Promotion
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Code</th>
                                    <th>Discount</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.map((promo) => (
                                    <tr key={promo.id}>
                                        <td className="fw-bold">{promo.code}</td>
                                        <td>{promo.discount}{promo.type === 'Percentage' ? '%' : ''}</td>
                                        <td>{promo.type}</td>
                                        <td>
                                            <span className={`badge ${promo.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                                                {promo.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(promo)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(promo.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Simple Modal Shim */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{formData.id ? 'Edit Promotion' : 'New Promotion'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Code</label>
                                    <input type="text" className="form-control" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Type</label>
                                    <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="Percentage">Percentage Discount</option>
                                        <option value="Fixed">Fixed Amount</option>
                                        <option value="Free Shipping">Free Shipping</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Discount Value</label>
                                    <input type="number" className="form-control" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPromotions;
