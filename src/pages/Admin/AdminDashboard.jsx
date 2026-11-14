import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadDashboardData = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                if (!isMounted) return;

                const data = res.data;
                setStats({
                    revenue: data.revenue || 0,
                    orders: data.orders || 0,
                    customers: data.customers || 0,
                    products: data.products || 0,
                });

                setRecentOrders(data.recentOrders || []);

                const maxQty = data.topProducts && data.topProducts.length > 0 
                    ? Math.max(...data.topProducts.map(p => Number(p.quantity || 1))) 
                    : 1;

                setTopProducts((data.topProducts || []).map((p) => ({
                    name: p.name,
                    price: Number(p.revenue || 0),
                    stock: Number(p.quantity || 0),
                    ratio: (Number(p.quantity || 0) / maxQty) * 100,
                })));

                setWeeklyData(data.weekly || [0, 0, 0, 0, 0, 0, 0]);
            } catch (error) {
                console.error('Dashboard data load error:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadDashboardData();
        return () => { isMounted = false; };
    }, []);

    const getStatusBadge = (status) => {
        const map = {
            pending: { bg: '#fef9c3', color: '#ca8a04', label: 'Chờ xác nhận' },
            processing: { bg: '#dbeafe', color: '#2563eb', label: 'Đang xử lý' },
            shipped: { bg: '#e0f2fe', color: '#0284c7', label: 'Đang giao' },
            delivered: { bg: '#dcfce7', color: '#16a34a', label: 'Đã giao' },
            cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Đã huỷ' },
        };
        const s = map[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
        return (
            <span style={{
                background: s.bg, color: s.color,
                padding: '3px 10px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 600
            }}>{s.label}</span>
        );
    };

    const formatCurrency = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' ₫';

    const statCards = [
        { label: 'Tổng Doanh Thu', value: formatCurrency(stats.revenue), icon: '💰', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
        { label: 'Đơn Hàng', value: stats.orders, icon: '📦', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
        { label: 'Khách Hàng', value: stats.customers, icon: '👥', gradient: 'linear-gradient(135deg,#ef4444,#b91c1c)' },
        { label: 'Sản Phẩm', value: stats.products, icon: '🍳', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
    ];

    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const maxVal = Math.max(...weeklyData, 1);

    if (loading) {
        return (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
                <div className="spinner-border text-primary" role="status"></div>
                <p style={{ marginTop: 12 }}>Đang tải dữ liệu dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard" style={{ fontFamily: "'Segoe UI', sans-serif", color: '#1e293b' }}>
            {/* Header */}
            <div className="admin-dashboard-header" style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>📊 Dashboard</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
                    Chào mừng trở lại! Đây là tổng quan hệ thống hôm nay.
                </p>
                <Link to="/" className="admin-home-link">🏠 Về trang chủ</Link>
            </div>

            {/* Stat Cards */}
            <div className="admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '20px', marginBottom: '28px' }}>
                {statCards.map((card, i) => (
                    <div key={i} style={{
                        background: card.gradient, borderRadius: '16px',
                        padding: '24px', color: '#fff',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        transition: 'transform 0.2s',
                        cursor: 'default',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{card.icon}</div>
                        <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>{card.value}</div>
                        <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '6px' }}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Chart + Top Products */}
            <div className="admin-dashboard-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
                {/* Weekly Bar Chart */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h5 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '16px' }}>📈 Đơn hàng trong tuần</h5>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '150px' }}>
                        {weeklyData.map((val, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{val}</span>
                                <div style={{
                                    width: '100%', height: `${(val / maxVal) * 110}px`,
                                    background: val > 0 ? 'linear-gradient(180deg,#667eea,#764ba2)' : '#f1f5f9',
                                    borderRadius: '6px 6px 0 0',
                                    transition: 'height 0.5s ease',
                                    minHeight: '4px',
                                }} />
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{weekDays[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h5 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '16px' }}>🏆 Sản phẩm giá trị cao</h5>
                    {topProducts.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Chưa có sản phẩm</p>
                    ) : (
                        topProducts.map((p, i) => (
                            <div key={i} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{p.name}</span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{formatCurrency(p.price)}</span>
                                </div>
                                <div style={{ background: '#f1f5f9', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${p.ratio}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg,#667eea,#764ba2)',
                                        borderRadius: '8px',
                                        transition: 'width 0.8s ease'
                                    }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h5 style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>🧾 Đơn hàng gần đây</h5>
                    <Link to="/admin/orders" style={{
                        fontSize: '13px', color: '#667eea', fontWeight: 600,
                        textDecoration: 'none', padding: '6px 14px',
                        border: '1.5px solid #667eea', borderRadius: '8px',
                        transition: 'all 0.2s'
                    }}>Xem tất cả →</Link>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    {recentOrders.length === 0 ? (
                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 24 }}>Chưa có đơn hàng nào</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                    {['Mã đơn', 'Khách hàng', 'Ngày đặt', 'Tổng tiền', 'Trạng thái'].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order, i) => (
                                    <tr key={order.id} style={{
                                        borderBottom: '1px solid #f8fafc',
                                        background: i % 2 === 0 ? '#fff' : '#fafbff',
                                        transition: 'background 0.15s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbff'}
                                    >
                                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#667eea' }}>#{order.id}</td>
                                        <td style={{ padding: '12px 14px', fontWeight: 500 }}>{order.customer}</td>
                                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{order.date}</td>
                                        <td style={{ padding: '12px 14px', fontWeight: 700 }}>{formatCurrency(order.total)}</td>
                                        <td style={{ padding: '12px 14px' }}>{getStatusBadge(order.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
