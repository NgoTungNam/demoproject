import React, { useCallback, useEffect, useState } from 'react'
import { API_BASE_URL } from '../../services/api'

const API = `${API_BASE_URL}/api`
const PAGE_SIZE = 20

const imageUrl = (value) => value?.startsWith('http') || value?.startsWith('/') ? value : `${API_BASE_URL}/${value || ''}`

function Stars({ rating }) {
  return <span aria-label={`${rating} trên 5 sao`} className="text-nowrap">
    {[1, 2, 3, 4, 5].map((star) => <i key={star} className={`bi ${star <= Number(rating) ? 'bi-star-fill text-danger' : 'bi-star text-muted'} me-1`} />)}
  </span>
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/reviews/admin/all?status=${filter}&page=${page}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || data.message || 'Không thể tải danh sách đánh giá.')
      setReviews(data.reviews || [])
      setTotal(Number(data.total || 0))
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'Lỗi kết nối máy chủ.' })
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const moderate = async (id, action) => {
    setBusyId(id)
    setMessage(null)
    try {
      const response = await fetch(`${API}/reviews/${id}/${action}`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || data.message || 'Không thể cập nhật đánh giá.')
      setMessage({ type: 'success', text: action === 'approve' ? 'Đã duyệt đánh giá.' : 'Đã ẩn đánh giá.' })
      await fetchReviews()
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'Lỗi kết nối máy chủ.' })
    } finally { setBusyId(null) }
  }

  const remove = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này? Thao tác này không thể hoàn tác.')) return
    setBusyId(id)
    setMessage(null)
    try {
      const response = await fetch(`${API}/reviews/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || data.message || 'Không thể xóa đánh giá.')
      setMessage({ type: 'success', text: 'Đã xóa đánh giá.' })
      await fetchReviews()
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'Lỗi kết nối máy chủ.' })
    } finally { setBusyId(null) }
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  return <section className="admin-reviews-page">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
      <div><span className="review-eyebrow">Chăm sóc khách hàng</span><h2 className="fw-bold mb-0">Quản lý đánh giá</h2></div>
      <span className="review-total-pill">{total} đánh giá</span>
    </div>

    {message && <div className={`alert alert-${message.type} alert-dismissible`} role="status">{message.text}<button type="button" className="btn-close" onClick={() => setMessage(null)} aria-label="Đóng" /></div>}

    <div className="review-filter-tabs mb-3" role="tablist" aria-label="Lọc trạng thái đánh giá">
      {[['all', 'Tất cả'], ['pending', 'Chờ duyệt'], ['approved', 'Đã duyệt'], ['hidden', 'Đã ẩn']].map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={filter === value}
        className={`btn ${filter === value ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => { setPage(1); setFilter(value) }}>{label}</button>)}
    </div>

    <div className="card border-0 shadow-sm"><div className="table-responsive">
      <table className="table table-hover align-middle mb-0 admin-review-table">
        <thead><tr><th>Sản phẩm</th><th>Khách hàng</th><th>Điểm</th><th>Feedback & ảnh</th><th>Trạng thái</th><th>Ngày gửi</th><th className="text-end">Thao tác</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={7} className="text-center py-5"><span className="spinner-border text-primary" /></td></tr>
            : reviews.length === 0 ? <tr><td colSpan={7} className="text-center text-muted py-5"><i className="bi bi-chat-square-text fs-2 d-block mb-2" />Chưa có đánh giá trong mục này.</td></tr>
              : reviews.map((review) => {
                let images = review.images || []
                if (!images.length && review.image_url) { try { images = JSON.parse(review.image_url) } catch { images = [review.image_url] } }
                return <tr key={review.id}>
                  <td className="review-admin-product">{review.product_name || `Sản phẩm #${review.product_id}`}<small>#{review.product_id}</small></td>
                  <td>{review.user_name || `Khách #${review.user_id}`}{review.is_verified_purchase && <span className="verified-badge d-block mt-1"><i className="bi bi-patch-check-fill" /> Đã mua hàng</span>}</td>
                  <td><Stars rating={review.rating} /></td>
                  <td className="review-admin-feedback"><p>{review.comment || <em className="text-muted">Không có nhận xét</em>}</p>{!!images.length && <div className="review-photo-grid">{images.map((img, index) => <a key={`${review.id}-${index}`} href={imageUrl(img)} target="_blank" rel="noreferrer"><img src={imageUrl(img)} alt={`Ảnh feedback ${index + 1}`} loading="lazy" /></a>)}</div>}</td>
                  <td><span className={`review-status status-${review.status}`}>{({ approved: 'Đã duyệt', pending: 'Chờ duyệt', hidden: 'Đã ẩn' })[review.status] || review.status}</span></td>
                  <td className="text-nowrap">{new Date(review.created_at).toLocaleDateString('vi-VN')}</td>
                  <td><div className="d-flex justify-content-end gap-1">
                    {review.status !== 'approved' && <button className="btn btn-sm btn-outline-success" disabled={busyId === review.id} onClick={() => moderate(review.id, 'approve')} title="Duyệt" aria-label="Duyệt"><i className="bi bi-check-lg" /></button>}
                    {review.status !== 'hidden' && <button className="btn btn-sm btn-outline-warning" disabled={busyId === review.id} onClick={() => moderate(review.id, 'hide')} title="Ẩn" aria-label="Ẩn"><i className="bi bi-eye-slash" /></button>}
                    <button className="btn btn-sm btn-outline-danger" disabled={busyId === review.id} onClick={() => remove(review.id)} title="Xóa" aria-label="Xóa"><i className="bi bi-trash" /></button>
                  </div></td>
                </tr>
              })}
        </tbody>
      </table>
    </div></div>

    {pages > 1 && <nav className="d-flex justify-content-between align-items-center mt-3" aria-label="Phân trang đánh giá">
      <span className="text-muted small">Trang {page}/{pages} · {total} đánh giá</span>
      <div className="btn-group"><button className="btn btn-outline-primary" disabled={page <= 1 || loading} onClick={() => setPage((n) => n - 1)}>Trước</button><button className="btn btn-outline-primary" disabled={page >= pages || loading} onClick={() => setPage((n) => n + 1)}>Sau</button></div>
    </nav>}
  </section>
}
