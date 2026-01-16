import React, { useState, useEffect } from 'react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Mock Data
        setOrders([
            { id: 101, customer: 'John Doe', date: '2023-05-20', total: 150.00, status: 'Delivered', payment: 'Credit Card' },
            { id: 102, customer: 'Jane Smith', date: '2023-06-02', total: 85.50, status: 'Processing', payment: 'COD' },
            { id: 103, customer: 'Bob Johnson', date: '2023-06-05', total: 200.00, status: 'Pending', payment: 'PayPal' },
        ]);
    }, []);

    const handleStatusChange = (id, newStatus) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-success';
            case 'Processing': return 'bg-primary';
            case 'Pending': return 'bg-warning';
            case 'Cancelled': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <div>
            <h2 className="mb-4">Orders</h2>
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Payment</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.customer}</td>
                                        <td>{order.date}</td>
                                        <td>{order.payment}</td>
                                        <td>${order.total.toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="btn-group">
                                                <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                                    Update Status
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li><button className="dropdown-item" onClick={() => handleStatusChange(order.id, 'Pending')}>Pending</button></li>
                                                    <li><button className="dropdown-item" onClick={() => handleStatusChange(order.id, 'Processing')}>Processing</button></li>
                                                    <li><button className="dropdown-item" onClick={() => handleStatusChange(order.id, 'Shipped')}>Shipped</button></li>
                                                    <li><button className="dropdown-item" onClick={() => handleStatusChange(order.id, 'Delivered')}>Delivered</button></li>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li><button className="dropdown-item text-danger" onClick={() => handleStatusChange(order.id, 'Cancelled')}>Cancelled</button></li>
                                                </ul>
                                            </div>
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

export default AdminOrders;
