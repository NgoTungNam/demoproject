import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Mock Orders
    const orders = [
        { id: 101, date: '2023-05-20', total: 150.00, status: 'Delivered' },
        { id: 102, date: '2023-06-02', total: 85.50, status: 'Processing' },
    ];

    return (
        <div className="container py-5">
            <h2 className="mb-4">My Account</h2>
            <div className="row">
                <div className="col-md-3">
                    <div className="list-group">
                        <button
                            className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile Information
                        </button>
                        <button
                            className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Order History
                        </button>
                    </div>
                </div>
                <div className="col-md-9">
                    {activeTab === 'profile' && (
                        <div className="card shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Profile Information</h5>
                            </div>
                            <div className="card-body">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" className="form-control" defaultValue={user?.name} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" defaultValue={user?.email} disabled />
                                    </div>
                                    <button type="button" className="btn btn-primary">Update Profile</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="card shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Order History</h5>
                            </div>
                            <div className="card-body">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td>#{order.id}</td>
                                                <td>{order.date}</td>
                                                <td>${order.total.toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${order.status === 'Delivered' ? 'bg-success' : 'bg-warning'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary">View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
