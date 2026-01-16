import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', email: '', role: 'customer' });

    useEffect(() => {
        // Mock data fetch
        setCustomers([
            { id: 1, name: 'Admin User', email: 'admin@gmail.com', role: 'admin', joinDate: '2023-01-01' },
            { id: 2, name: 'Customer User', email: 'customer@gmail.com', role: 'customer', joinDate: '2023-02-15' },
            { id: 3, name: 'John Doe', email: 'john@example.com', role: 'customer', joinDate: '2023-03-10' },
        ]);
    }, []);

    const handleEdit = (customer) => {
        setFormData({ ...customer });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setCustomers(customers.filter(c => c.id !== id));
        }
    };

    const handleSave = () => {
        setCustomers(customers.map(c => c.id === formData.id ? { ...c, name: formData.name, role: formData.role } : c));
        setShowModal(false);
    };

    return (
        <div>
            <h2 className="mb-4">Customer Management</h2>
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Join Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>#{customer.id}</td>
                                        <td>{customer.name}</td>
                                        <td>{customer.email}</td>
                                        <td>
                                            <span className={`badge ${customer.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                {customer.role}
                                            </span>
                                        </td>
                                        <td>{customer.joinDate}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(customer)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(customer.id)}>
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

            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Customer</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" value={formData.email} disabled />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <select className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
