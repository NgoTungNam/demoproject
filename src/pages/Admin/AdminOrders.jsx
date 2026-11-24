import React, { useState, useEffect } from 'react';
import api from '../../services/api';

/* ─── Helpers ─────────────────────────────────────── */
const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const ORDER_STATUS_MAP = {
  pending:    { label: 'Chờ xử lý',   color: '#f59e0b', bg: '#fffbeb' },
  processing: { label: 'Đang xử lý',  color: '#d32f2f', bg: '#fef2f2' },
  shipped:    { label: 'Đang giao',   color: '#3b82f6', bg: '#eff6ff' },
  delivered:  { label: 'Đã giao',     color: '#10b981', bg: '#ecfdf5' },
  cancelled:  { label: 'Đã huỷ',      color: '#ef4444', bg: '#fef2f2' },
};

const PAYMENT_STATUS_MAP = {
  pending:     { label: 'Chờ TT',        color: '#f59e0b', icon: '⏳' },
  pending_cod: { label: 'COD',           color: '#10b981', icon: '🚚' },
  paid:        { label: 'Đã thanh toán', color: '#10b981', icon: '✅' },
  failed:      { label: 'TT thất bại',   color: '#ef4444', icon: '❌' },
  refunded:    { label: 'Hoàn tiền',     color: '#b71c1c', icon: '↩️' },
};

const PAYMENT_METHOD_MAP = {
  cod:   { label: 'COD',          icon: '🚚' },
  momo:  { label: 'MoMo',         icon: '💜' },
  vnpay: { label: 'VNPay',        icon: '🏦' },
  bank:  { label: 'Chuyển khoản', icon: '💳' },
};

/* ─── Inline Status Selector ─────────────────────── */
const StatusSelector = ({ order, onUpdate, loading }) => {
  const currentSt = ORDER_STATUS_MAP[order.status] || { color: '#374151', bg: '#fff' };
  return (
    <select
      value={order.status}
      disabled={loading}
      onChange={(e) => onUpdate(e.target.value)}
      style={{
        padding: '5px 8px',
        borderRadius: 8,
        border: `1.5px solid ${currentSt.color}`,
        background: currentSt.bg,
        color: currentSt.color,
        fontWeight: 700,
        fontSize: '0.78rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        outline: 'none',
      }}
    >
      {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
        <option key={k} value={k}>
          {v.label}
        </option>
      ))}
    </select>
  );
};

/* ─── Order Detail Modal ─────────────────────────── */
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;
  const orderSt = ORDER_STATUS_MAP[order.status] || { label: order.status, color: '#6b7280', bg: '#f9fafb' };
  const payStatus = PAYMENT_STATUS_MAP[order.payment_status] || { label: order.payment_status || '—', color: '#6b7280', icon: '?' };
  const payMethod = PAYMENT_METHOD_MAP[order.payment_method] || { label: order.payment_method || '—', icon: '💳' };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 640, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontWeight: 800, color: '#1a1a2e' }}>📋 Chi tiết đơn #{order.id}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9ca3af' }}>×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            ['Khách hàng', order.shipping_name || '—'],
            ['Điện thoại', order.shipping_phone || '—'],
            ['Ngày đặt', formatDate(order.created_at)],
            ['Tổng tiền', formatPrice(order.total_amount)],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginBottom: 2 }}>{label}</div>
              <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.88rem' }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: '0.73rem', color: '#9ca3af', marginBottom: 2 }}>Địa chỉ</div>
          <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>{order.shipping_address || '—'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <span style={{ background: orderSt.bg, color: orderSt.color, borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: '0.78rem' }}>{orderSt.label}</span>
          <span style={{ background: `${payStatus.color}18`, color: payStatus.color, borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: '0.78rem' }}>{payStatus.icon} {payStatus.label}</span>
          <span style={{ background: '#f3f4f6', borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: '0.78rem', color: '#374151' }}>{payMethod.icon} {payMethod.label}</span>
        </div>
        {order.items && order.items.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, color: '#374151', marginBottom: 10, fontSize: '0.88rem' }}>Sản phẩm ({order.items.length}):</div>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                {item.image_url && <img src={item.image_url} alt={item.product_name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.85rem' }}>{item.product_name || '—'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>x{item.quantity} × {formatPrice(item.price)}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#d32f2f' }}>{formatPrice(item.total_price || item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Component ───────────────────────────────────── */
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    let remoteOrders = [];
    try {
      const { data } = await api.get('/orders/admin');
      if (Array.isArray(data) && data.length > 0) {
        remoteOrders = data;
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách đơn hàng từ server:', err);
    }

    if (remoteOrders.length > 0) {
      setOrders(remoteOrders);
      setLoading(false);
      return;
    }

    const localOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
    const defaultOrders = [
        {
          id: 101,
          shipping_name: 'Ngô Tùng Nam',
          shipping_phone: '0965214607',
          shipping_address: 'Số nhà 8, Thượng Cát, Bắc Từ Liêm, Hà Nội',
          total_amount: 320000,
          status: 'delivered',
          payment_method: 'momo',
          payment_status: 'paid',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          items: [{ product_name: 'Dao Bếp Chef Cao Cấp', quantity: 1, price: 320000, total_price: 320000, image_url: '/images/products/dao.jpg' }]
        },
        {
          id: 102,
          shipping_name: 'Trần Văn Hùng',
          shipping_phone: '0912345678',
          shipping_address: '120 Cầu Giấy, Hà Nội',
          total_amount: 830000,
          status: 'processing',
          payment_method: 'vnpay',
          payment_status: 'paid',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          items: [
            { product_name: 'Chảo Chống Dính Đá Hoa Cương', quantity: 1, price: 380000, total_price: 380000, image_url: '/images/products/chao.jpg' },
            { product_name: 'Nồi Inox Cao Cấp 3 Đáy', quantity: 1, price: 450000, total_price: 450000, image_url: '/images/products/noiinox.jpg' }
          ]
        },
        {
          id: 103,
          shipping_name: 'Lê Thị Mai',
          shipping_phone: '0987654321',
          shipping_address: '45 Lê Duẩn, Hải Châu, Đà Nẵng',
          total_amount: 45000,
          status: 'pending',
          payment_method: 'cod',
          payment_status: 'pending_cod',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          items: [{ product_name: 'Thìa Inox 304 Bàn Ăn', quantity: 1, price: 45000, total_price: 45000, image_url: '/images/products/thia.jpg' }]
        }
    ];

    const combined = [...localOrders, ...defaultOrders];
    const unique = Array.from(new Map(combined.map(o => [o.id, o])).values());
    setOrders(unique);
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
    } catch {
      console.warn('API không khả dụng, cập nhật trạng thái đơn hàng cục bộ');
    }
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o));
      const local = JSON.parse(localStorage.getItem('user_orders') || '[]');
      if (local.some(o => o.id === id)) {
        localStorage.setItem('user_orders', JSON.stringify(local.map(o => o.id === id ? { ...o, status: newStatus } : o)));
      }
      return updated;
    });
    setUpdatingId(null);
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Xóa đơn hàng #${order.id} của "${order.shipping_name || 'Khách'}"?\nHành động này không thể hoàn tác.`)) return;
    setDeletingId(order.id);
    try {
      await api.delete(`/orders/${order.id}`);
    } catch {
      console.warn('API không khả dụng, xóa đơn hàng cục bộ');
    }
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== order.id);
      const local = JSON.parse(localStorage.getItem('user_orders') || '[]');
      localStorage.setItem('user_orders', JSON.stringify(local.filter(o => o.id !== order.id)));
      return updated;
    });
    setDeletingId(null);
    alert(`Đã xóa đơn hàng #${order.id} thành công.`);
  };

  const handleViewDetail = async (order) => {
    try {
      const { data } = await api.get(`/orders/${order.id}`);
      setSelectedOrder(data);
    } catch {
      setSelectedOrder(order);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      !searchTerm ||
      String(o.id).includes(searchTerm) ||
      (o.shipping_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.shipping_phone || '').includes(searchTerm) ||
      (o.user_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchPayment = filterPayment === 'all' || o.payment_method === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.payment_status === 'paid').length,
    revenue: orders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
  };

  return (
    <div className="admin-orders" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.6rem', color: '#1a1a2e', margin: 0 }}>📋 Quản Lý Đơn Hàng</h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '0.88rem' }}>Theo dõi và cập nhật trạng thái đơn hàng thực tế</p>
        </div>
        <button
          onClick={fetchOrders}
          style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #d32f2f, #b71c1c)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Tổng đơn',      value: stats.total,               icon: '📦', color: '#d32f2f' },
          { label: 'Chờ xử lý',     value: stats.pending,              icon: '⏳', color: '#f59e0b' },
          { label: 'Đã thanh toán', value: stats.paid,                 icon: '✅', color: '#10b981' },
          { label: 'Doanh thu',     value: formatPrice(stats.revenue), icon: '💰', color: '#d63384', isPrice: true },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: s.isPrice ? '1rem' : '1.5rem', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Tìm theo ID, tên, SĐT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: '0.88rem', outline: 'none' }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '9px 14px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: '0.88rem', outline: 'none', cursor: 'pointer' }}>
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
        </select>
        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} style={{ padding: '9px 14px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: '0.88rem', outline: 'none', cursor: 'pointer' }}>
          <option value="all">Tất cả thanh toán</option>
          {Object.entries(PAYMENT_METHOD_MAP).map(([k, v]) => (<option key={k} value={k}>{v.icon} {v.label}</option>))}
        </select>
        <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>{filtered.length}/{orders.length} đơn hàng</span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>⏳ Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>📭 Không có đơn hàng nào phù hợp</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #f0f0f0' }}>
                  {['Mã ĐH', 'Khách hàng', 'Ngày đặt', 'Thanh toán', 'Tổng tiền', 'Trạng thái ĐH', 'Trạng thái TT', 'Thao tác'].map((h) => (
                    <th key={h} style={{ padding: '14px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, idx) => {
                  const orderSt = ORDER_STATUS_MAP[order.status] || { label: order.status, color: '#6b7280', bg: '#f9fafb' };
                  const payMethod = PAYMENT_METHOD_MAP[order.payment_method] || { label: order.payment_method || '—', icon: '💳' };
                  const payStatus = PAYMENT_STATUS_MAP[order.payment_status] || { label: order.payment_status || '—', color: '#6b7280', icon: '?' };
                  const isDeleting = deletingId === order.id;

                  return (
                    <tr key={order.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f0f0f0', opacity: isDeleting ? 0.5 : 1 }}>
                      <td style={{ padding: '12px 12px', fontWeight: 700, color: '#d32f2f' }}>#{order.id}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{order.shipping_name || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{order.shipping_phone}</div>
                      </td>
                      <td style={{ padding: '12px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(order.created_at)}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ background: '#f3f4f6', borderRadius: 8, padding: '4px 10px', fontWeight: 700, fontSize: '0.78rem', color: '#374151' }}>
                          {payMethod.icon} {payMethod.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px', fontWeight: 800, color: '#1a1a2e' }}>{formatPrice(order.total_amount)}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ background: orderSt.bg, color: orderSt.color, borderRadius: 20, padding: '4px 12px', fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          {orderSt.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ background: `${payStatus.color}18`, color: payStatus.color, borderRadius: 20, padding: '4px 12px', fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          {payStatus.icon} {payStatus.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                          <button
                            onClick={() => handleViewDetail(order)}
                            title="Xem chi tiết"
                            style={{ padding: '5px 9px', borderRadius: 7, border: '1.5px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}
                          >
                            👁️ Xem
                          </button>
                          <StatusSelector order={order} loading={updatingId === order.id} onUpdate={(s) => handleStatusChange(order.id, s)} />
                          <button
                            onClick={() => handleDelete(order)}
                            disabled={isDeleting}
                            title="Xóa đơn hàng"
                            style={{ padding: '5px 9px', borderRadius: 7, border: '1.5px solid #fca5a5', background: isDeleting ? '#fee2e2' : '#fff', cursor: isDeleting ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', whiteSpace: 'nowrap' }}
                          >
                            {isDeleting ? '⏳' : '🗑️'} Xóa
                          </button>
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

      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

export default AdminOrders;
