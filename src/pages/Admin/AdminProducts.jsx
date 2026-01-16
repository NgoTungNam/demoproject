import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Mock Data
        setProducts([
            { id: 1, name: 'Stainless Steel Pan', price: 45.00, category: 'Cookware', stock: 20 },
            { id: 2, name: 'Chef Knife', price: 80.00, category: 'Cutlery', stock: 15 },
            { id: 3, name: 'Blender 3000', price: 120.00, category: 'Appliances', stock: 5 },
        ]);
    }, []);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
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
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>#{product.id}</td>
                                        <td>{product.name}</td>
                                        <td>{product.category}</td>
                                        <td>${product.price.toFixed(2)}</td>
                                        <td>{product.stock}</td>
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
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
