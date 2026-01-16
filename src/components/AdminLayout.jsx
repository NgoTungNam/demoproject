import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="d-flex min-vh-100">
            {/* Sidebar */}
            <div className="bg-dark text-white p-3" style={{ width: '250px', flexShrink: 0 }}>
                <h4 className="mb-4 text-center">Admin Panel</h4>
                <div className="mb-4 px-2">
                    <small className="text-muted">Welcome,</small>
                    <div className="fw-bold">{user?.name}</div>
                </div>
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item mb-2">
                        <Link to="/admin/dashboard" className={`nav-link text-white ${isActive('/admin/dashboard')}`}>
                            <i className="bi bi-speedometer2 me-2"></i> Dashboard
                        </Link>
                    </li>
                    <li className="nav-item mb-2">
                        <Link to="/admin/products" className={`nav-link text-white ${isActive('/admin/products')}`}>
                            <i className="bi bi-box-seam me-2"></i> Products
                        </Link>
                    </li>
                    <li className="nav-item mb-2">
                        <Link to="/admin/categories" className={`nav-link text-white ${isActive('/admin/categories')}`}>
                            <i className="bi bi-tags me-2"></i> Categories
                        </Link>
                    </li>
                    <li className="nav-item mb-2">
                        <Link to="/admin/orders" className={`nav-link text-white ${isActive('/admin/orders')}`}>
                            <i className="bi bi-cart-check me-2"></i> Orders
                        </Link>
                    </li>
                    <li className="nav-item mb-2">
                        <Link to="/admin/customers" className={`nav-link text-white ${isActive('/admin/customers')}`}>
                            <i className="bi bi-people me-2"></i> Customers
                        </Link>
                    </li>
                    <li className="nav-item mb-2">
                        <Link to="/admin/promotions" className={`nav-link text-white ${isActive('/admin/promotions')}`}>
                            <i className="bi bi-percent me-2"></i> Promotions
                        </Link>
                    </li>
                </ul>
                <hr />
                <button onClick={logout} className="btn btn-outline-light w-100">
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 bg-light">
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
