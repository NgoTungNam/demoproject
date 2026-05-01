import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/products',  icon: '🛋️', label: 'Sản phẩm' },
    { path: '/admin/categories',icon: '🏷️', label: 'Danh mục' },
    { path: '/admin/orders',    icon: '📦', label: 'Đơn hàng' },
    { path: '/admin/customers', icon: '👥', label: 'Khách hàng' },
    { path: '/admin/promotions',icon: '🎁', label: 'Khuyến mãi' },
];

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>
            {/* Sidebar */}
            <div style={{
                width: '240px', flexShrink: 0,
                background: 'linear-gradient(180deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%)',
                display: 'flex', flexDirection: 'column',
                boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
                position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
            }}>
                {/* Logo */}
                <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                        🏠 Admin Panel
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'linear-gradient(135deg,#a78bfa,#818cf8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px', fontWeight: 700, color: '#fff'
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', color: '#c7d2fe', lineHeight: 1 }}>Xin chào,</div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{user?.name || 'Admin'}</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ padding: '16px 12px', flex: 1 }}>
                    {navItems.map(item => {
                        const active = isActive(item.path);
                        return (
                            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '11px 14px', borderRadius: '10px',
                                    marginBottom: '4px', cursor: 'pointer',
                                    background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                                    color: active ? '#fff' : '#a5b4fc',
                                    fontWeight: active ? 700 : 400,
                                    fontSize: '14px',
                                    transition: 'all 0.2s',
                                    borderLeft: active ? '3px solid #a78bfa' : '3px solid transparent',
                                }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div style={{ padding: '16px 12px' }}>
                    <button onClick={logout} style={{
                        width: '100%', padding: '11px', borderRadius: '10px',
                        border: '1.5px solid rgba(255,255,255,0.25)',
                        background: 'transparent', color: '#c7d2fe',
                        cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c7d2fe'; }}
                    >
                        🚪 Đăng xuất
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, background: '#f8fafc', overflowY: 'auto' }}>
                <div style={{ padding: '32px' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
