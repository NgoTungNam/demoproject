import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        setStats({ revenue: 24580, orders: 128, customers: 312, products: 45 });
        setRecentOrders([
            { id: 101, customer: 'Nguyễn Văn A', date: '2024-05-01', total: 1500000, status: 'Delivered' },
            { id: 102, customer: 'Trần Thị B', date: '2024-05-01', total: 850000, status: 'Processing' },
            { id: 103, customer: 'Lê Văn C', date: '2024-04-30', total: 2000000, status: 'Pending' },
            { id: 104, customer: 'Phạm Thị D', date: '2024-04-30', total: 650000, status: 'Delivered' },
            { id: 105, customer: 'Hoàng Văn E', date: '2024-04-29', total: 1200000, status: 'Cancelled' },
        ]);
        setTopProducts([
            { name: 'Tủ bếp gỗ sồi', sales: 42, revenue: 8400000 },
            { name: 'Kệ TV hiện đại', sales: 36, revenue: 5400000 },
            { name: 'Bàn ăn 6 ghế', sales: 28, revenue: 6720000 },
            { name: 'Giường ngủ King', sales: 21, revenue: 7350000 },
        ]);
    }, []);

    const getStatusBadge = (status) => {
        const map = {
            Delivered: { bg: '#dcfce7', color: '#16a34a', label: 'Đã giao' },
            Processing: { bg: '#dbeafe', color: '#2563eb', label: 'Đang xử lý' },
            Pending: { bg: '#fef9c3', color: '#ca8a04', label: 'Chờ xác nhận' },
            Cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Đã huỷ' },
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

    const formatCurrency = (v) => v.toLocaleString('vi-VN') + ' ₫';

    const statCards = [
        { label: 'Doanh Thu', value: formatCurrency(stats.revenue * 1000), icon: '💰', gradient: 'linear-gradient(135deg,#667eea,#764ba2)', change: '+12.5%' },
        { label: 'Đơn Hàng', value: stats.orders, icon: '📦', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', change: '+8.2%' },
        { label: 'Khách Hàng', value: stats.customers, icon: '👥', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', change: '+15.3%' },
        { label: 'Sản Phẩm', value: stats.products, icon: '🛋️', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', change: '+3.1%' },
    ];

    const weeklyData = [65, 45, 80, 55, 90, 70, 85];
    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const maxVal = Math.max(...weeklyData);

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", color: '#1e293b' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>📊 Dashboard</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
                    Chào mừng trở lại! Đây là tổng quan hệ thống hôm nay.
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '20px', marginBottom: '28px' }}>
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
                        <div style={{
                            marginTop: '12px', background: 'rgba(255,255,255,0.25)',
                            display: 'inline-block', padding: '2px 8px',
                            borderRadius: '12px', fontSize: '12px', fontWeight: 600
                        }}>{card.change} so với tháng trước</div>
                    </div>
                ))}
            </div>

            {/* Chart + Top Products */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
                {/* Weekly Bar Chart */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h5 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '16px' }}>📈 Đơn hàng trong tuần</h5>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '150px' }}>
                        {weeklyData.map((val, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{val}</span>
                                <div style={{
                                    width: '100%', height: `${(val / maxVal) * 110}px`,
                                    background: 'linear-gradient(180deg,#667eea,#764ba2)',
                                    borderRadius: '6px 6px 0 0',
                                    transition: 'height 0.5s ease'
                                }} />
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{weekDays[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h5 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '16px' }}>🏆 Sản phẩm bán chạy</h5>
                    {topProducts.map((p, i) => (
                        <div key={i} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{p.name}</span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>{p.sales} đơn</span>
                            </div>
                            <div style={{ background: '#f1f5f9', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${(p.sales / 42) * 100}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg,#667eea,#764ba2)',
                                    borderRadius: '8px',
                                    transition: 'width 0.8s ease'
                                }} />
                            </div>
                        </div>
                    ))}
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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
