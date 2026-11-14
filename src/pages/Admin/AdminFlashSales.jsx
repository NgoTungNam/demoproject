import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../services/api'

const API_URL = `${API_BASE_URL}/api`

const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0)

const AdminFlashSales = () => {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    name: '', start_time: '', end_time: '', is_active: true, items: []
  })

  const fetchSales = async () => {
    try {
      const res = await fetch(`${API_URL}/flash-sales/admin/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setSales(await res.json())
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`)
      setProducts(await res.json())
    } catch {}
  }

  useEffect(() => { fetchSales(); fetchProducts() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', start_time: '', end_time: '', is_active: true, items: [] })
    setShowForm(true)
    setMsg('')
  }

  const openEdit = (sale) => {
    setEditing(sale)
    setForm({
      name: sale.name,
      start_time: toLocalInput(sale.start_time),
      end_time: toLocalInput(sale.end_time),
      is_active: !!sale.is_active,
      items: sale.items?.map(i => ({ product_id: i.product_id, flash_price: i.flash_price, quantity: i.quantity })) || []
    })
    setShowForm(true)
    setMsg('')
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', flash_price: '', quantity: 50 }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i, field, val) => setForm(f => ({
    ...f,
    items: f.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item)
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const url = editing ? `${API_URL}/flash-sales/${editing.id}` : `${API_URL}/flash-sales`
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          ...form,
          start_time: new Date(form.start_time).toISOString(),
          end_time: new Date(form.end_time).toISOString(),
        })
      })
      const data = await res.json()
      if (!res.ok) { setMsg('❌ ' + (data.error || data.message)); return }
      setMsg('✅ ' + (editing ? 'Đã cập nhật!' : 'Đã tạo Flash Sale!'))
      setShowForm(false)
      fetchSales()
    } catch { setMsg('❌ Lỗi kết nối') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa Flash Sale này?')) return
    await fetch(`${API_URL}/flash-sales/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    fetchSales()
  }

  const toggleActive = async (sale) => {
    await fetch(`${API_URL}/flash-sales/${sale.id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    fetchSales()
  }

  const toLocalInput = (dt) => {
    if (!dt) return ''
    const local = new Date(dt)
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset())
    return local.toISOString().slice(0, 16)
  }
  const statusBadge = (sale) => {
    const now = new Date()
    const start = new Date(sale.start_time)
    const end = new Date(sale.end_time)
    if (!sale.is_active) return <span className="badge bg-secondary">Tắt</span>
    if (now < start) return <span className="badge bg-info">Chưa bắt đầu</span>
    if (now > end) return <span className="badge bg-danger">Đã kết thúc</span>
    return <span className="badge bg-success">Đang chạy ⚡</span>
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: 800 }}>⚡ Quản Lý Flash Sale</h2>
        <button className="btn btn-warning fw-bold" onClick={openNew}>
          <i className="bi bi-plus-circle"></i> Tạo Flash Sale mới
        </button>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      {/* Form */}
      {showForm && (
        <div className="card mb-4" style={{ borderRadius: 14, border: '2px solid #fbbf24' }}>
          <div className="card-body">
            <h5 className="mb-3">{editing ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tên chương trình *</label>
                  <input className="form-control" value={form.name} required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Bắt đầu *</label>
                  <input type="datetime-local" className="form-control" value={form.start_time} required
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Kết thúc *</label>
                  <input type="datetime-local" className="form-control" value={form.end_time} required
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                </div>
              </div>
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} id="fsActive" />
                <label className="form-check-label" htmlFor="fsActive">Kích hoạt ngay</label>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <h6 className="fw-bold mb-0">Sản phẩm Flash Sale</h6>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
                    <i className="bi bi-plus"></i> Thêm sản phẩm
                  </button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} className="row g-2 mb-2 align-items-center">
                    <div className="col-md-5">
                      <select className="form-select" value={item.product_id}
                        onChange={e => updateItem(i, 'product_id', e.target.value)}>
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({fmt(p.price)})</option>)}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <input type="number" className="form-control" placeholder="Giá Flash"
                        value={item.flash_price} onChange={e => updateItem(i, 'flash_price', e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <input type="number" className="form-control" placeholder="Số lượng"
                        value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(i)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {msg && <div className="alert alert-danger py-2">{msg}</div>}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-warning fw-bold">Lưu</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>
      ) : (
        <div className="card" style={{ borderRadius: 14 }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ background: '#fef3c7' }}>
                <tr>
                  <th>Tên chương trình</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Sản phẩm</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-4">Chưa có Flash Sale nào</td></tr>
                ) : sales.map(sale => (
                  <tr key={sale.id}>
                    <td><strong>{sale.name}</strong></td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(sale.start_time).toLocaleString('vi-VN')}</td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(sale.end_time).toLocaleString('vi-VN')}</td>
                    <td><span className="badge bg-light text-dark">{sale.item_count || 0} sản phẩm</span></td>
                    <td>{statusBadge(sale)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(sale)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => toggleActive(sale)} title="Bật/Tắt">
                          <i className={`bi ${sale.is_active ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(sale.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminFlashSales
