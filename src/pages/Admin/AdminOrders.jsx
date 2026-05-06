import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

/* ─── Helpers ─────────────────────────────────────── */
const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const ORDER_STATUS_MAP = {
  pending:    { label: 'Chờ xử lý',   color: '#f59e0b', bg: '#fffbeb' },
  processing: { label: 'Đang xử lý',  color: '#6366f1', bg: '#eef2ff' },
  shipped:    { label: 'Đang giao',   color: '#3b82f6', bg: '#eff6ff' },
  delivered:  { label: 'Đã giao',     color: '#10b981', bg: '#ecfdf5' },
  cancelled:  { label: 'Đã huỷ',      color: '#ef4444', bg: '#fef2f2' },
};

const PAYMENT_STATUS_MAP = {
  pending:     { label: 'Chờ TT',       color: '#f59e0b', icon: '⏳' },
  pending_cod: { label: 'COD',          color: '#10b981', icon: '🚚' },
  paid:        { label: 'Đã thanh toán',color: '#10b981', icon: '✅' },
  failed:      { label: 'TT thất bại',  color: '#ef4444', icon: '❌' },
  refunded:    { label: 'Hoàn tiền',    color: '#8b5cf6', icon: '↩️' },
};

const PAYMENT_METHOD_MAP = {
  cod:   { label: 'COD',           icon: '🚚' },
  momo:  { label: 'MoMo',          icon: '💜' },
  vnpay: { label: 'VNPay',         icon: '🏦' },
  bank:  { label: 'Chuyển khoản',  icon: '💳' },
};

/* ─── Component ───────────────────────────────────── */
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  /* Load orders from DB */
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/orders/admin`);
      setOrders(data);
    } catch {
      // Fallback mock nếu endpoint chưa có
      setOrders([
        {
          id: 1, shipping_name: 'Nguyễn Văn A', shipping_phone: '0901234567',
          shipping_address: '123 Đường ABC, TP.HCM', created_at: new Date().toISOString(),
          total_amount: 1250000, status: 'pending',
          payment_method: 'momo', payment_status: 'paid',
        },
        {
          id: 2, shipping_name: 'Trần Thị B', shipping_phone: '0912345678',
          shipping_address: '456 Đường XYZ, Hà Nội', created_at: new Date(Date.now() - 86400000).toISOString(),
          total_amount: 890000, status: 'processing',
          payment_method: 'cod', payment_status: 'pending_cod',
        },
        {
          id: 3, shipping_name: 'Lê Văn C', shipping_phone: '0923456789',
          shipping_address: '789 Đường DEF, Đà Nẵng', created_at: new Date(Date.now() - 172800000).toISOString(),
          total_amount: 3200000, status: 'delivered',
          payment_method: 'vnpay', payment_status: 'paid',
        },
        {
          id: 4, shipping_name: 'Phạm Thị D', shipping_phone: '0934567890',
          shipping_address: '321 Đường GHI, Cần Thơ', created_at: new Date(Date.now() - 259200000).toISOString(),
          total_amount: 560000, status: 'cancelled',
          payment_method: 'bank', payment_status: 'pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* Update order status */
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await axios.patch(`${API_BASE}/orders/${id}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    } finally {
      setUpdatingId(null);
    }
  };

  /* Filters */
  const filtered = orders.filter((o) => {
    const matchSearch =
      !searchTerm ||
      String(o.id).includes(searchTerm) ||
      o.shipping_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shipping_phone?.includes(searchTerm);
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchPayment = filterPayment === 'all' || o.payment_method === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  /* Stats */
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.payment_status === 'paid').length,
    revenue: orders.filter((o) => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount || 0), 0),
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.6rem', color: '#1a1a2e', margin: 0 }}>
            📋 Quản Lý Đơn Hàng
          </h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '0.88rem' }}>
            Theo dõi và cập nhật trạng thái đơn hàng & thanh toán
          </p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            padding: '8px 18px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
          }}
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Tổng đơn', value: stats.total, icon: '📦', color: '#6366f1' },
          { label: 'Chờ xử lý', value: stats.pending, icon: '⏳', color: '#f59e0b' },
          { label: 'Đã thanh toán', value: stats.paid, icon: '✅', color: '#10b981' },
          { label: 'Doanh thu', value: formatPrice(stats.revenue), icon: '💰', color: '#d63384', isPrice: true },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: '#fff', borderRadius: 16, padding: '18px 20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${s.color}`,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: s.isPrice ? '1rem' : '1.5rem', color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: '#fff', borderRadius: 16, padding: '16px 20px',
          marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="🔍 Tìm theo ID, tên, SĐT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 10,
            border: '2px solid #e5e7eb', fontSize: '0.88rem', outline: 'none',
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 10, border: '2px solid #e5e7eb',
            fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 10, border: '2px solid #e5e7eb',
            fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">Tất cả thanh toán</option>
          {Object.entries(PAYMENT_METHOD_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
        <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
          {filtered.length}/{orders.length} đơn hàng
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          background: '#fff', borderRadius: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
            ⏳ Đang tải dữ liệu...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
            📭 Không có đơn hàng nào phù hợp
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #f0f0f0' }}>
                  {['Mã ĐH', 'Khách hàng', 'Ngày đặt', 'Thanh toán', 'Tổng tiền', 'Trạng thái ĐH', 'Trạng thái TT', 'Thao tác'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 16px', textAlign: 'left', fontWeight: 700,
                        color: '#374151', fontSize: '0.82rem', whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, idx) => {
                  const orderSt = ORDER_STATUS_MAP[order.status] || { label: order.status, color: '#6b7280', bg: '#f9fafb' };
                  const payMethod = PAYMENT_METHOD_MAP[order.payment_method] || { label: order.payment_method || '—', icon: '💳' };
                  const payStatus = PAYMENT_STATUS_MAP[order.payment_status] || { label: order.payment_status || '—', color: '#6b7280', icon: '?' };

                  return (
                    <tr
                      key={order.id}
                      style={{
                        background: idx % 2 === 0 ? '#fff' : '#fafafa',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* ID */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#6366f1' }}>
                        #{order.id}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{order.shipping_name || '—'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{order.shipping_phone}</div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {formatDate(order.created_at)}
                      </td>

                      {/* Payment method */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            background: '#f3f4f6', borderRadius: 8, padding: '4px 10px',
                            fontWeight: 700, fontSize: '0.8rem', color: '#374151',
                          }}
                        >
                          {payMethod.icon} {payMethod.label}
                        </span>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#1a1a2e' }}>
                        {formatPrice(order.total_amount)}
                      </td>

                      {/* Order status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            background: orderSt.bg, color: orderSt.color,
                            borderRadius: 20, padding: '4px 12px',
                            fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap',
                          }}
                        >
                          {orderSt.label}
                        </span>
                      </td>

                      {/* Payment status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            background: `${payStatus.color}18`, color: payStatus.color,
                            borderRadius: 20, padding: '4px 12px',
                            fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap',
                          }}
                        >
                          {payStatus.icon} {payStatus.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            disabled={updatingId === order.id}
                            style={{ fontSize: '0.8rem', borderRadius: 8 }}
                          >
                            {updatingId === order.id ? '⏳' : '⚙️ Cập nhật'}
                          </button>
                          <ul className="dropdown-menu">
                            {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
                              <li key={k}>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleStatusChange(order.id, k)}
                                  style={{ fontSize: '0.85rem', fontWeight: order.status === k ? 700 : 400 }}
                                >
                                  {order.status === k ? '✓ ' : ''}{v.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
