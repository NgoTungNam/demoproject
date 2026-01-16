import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        // Mock fetch
        setCategories([
            { id: 1, name: 'Cookware', description: 'Pots and pans' },
            { id: 2, name: 'Cutlery', description: 'Knives and scissors' },
            { id: 3, name: 'Appliances', description: 'Blenders and mixers' },
        ]);
    }, []);

    const handleEdit = (category) => {
        setFormData({ name: category.name, description: category.description });
        setEditingId(category.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    const handleSave = () => {
        if (editingId) {
            setCategories(categories.map(c => c.id === editingId ? { ...c, ...formData } : c));
        } else {
            setCategories([...categories, { id: Date.now(), ...formData }]);
        }
        setShowModal(false);
        setFormData({ name: '', description: '' });
        setEditingId(null);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Categories</h2>
                <button className="btn btn-primary" onClick={() => { setFormData({ name: '', description: '' }); setEditingId(null); setShowModal(true); }}>
                    <i className="bi bi-plus-lg me-2"></i> Add Category
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>#{cat.id}</td>
                                        <td>{cat.name}</td>
                                        <td>{cat.description}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(cat)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat.id)}>
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
                                <h5 className="modal-title">{editingId ? 'Edit Category' : 'New Category'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Category Name</label>
                                    <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
