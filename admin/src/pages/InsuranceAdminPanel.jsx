import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return 'https://guild1882-backend.vercel.app';
    }
    return envUrl;
  }
  return envUrl || 'http://localhost:5000';
}
const API = getApiUrl();

export default function InsuranceAdminPanel({ token, onLogout }) {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editAdmin, setEditAdmin] = useState(null)

  // Form State — level mặc định là 1
  const [formData, setFormData] = useState({
    name: '', title: '', facebook: '', zalo: '', tradeTag: '', level: 1
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/api/insurance`)
      setAdmins(data)
    } catch {
      toast.error('Lỗi tải dữ liệu Bảo hiểm GD')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setEditAdmin(admin)
      setFormData({
        name: admin.name,
        title: admin.title,
        facebook: admin.facebook,
        zalo: admin.zalo,
        tradeTag: admin.tradeTag,
        level: admin.level || 1   // ← load level từ DB
      })
      setAvatarPreview(admin.avatarUrl)
      setAvatarFile(null)
    } else {
      setEditAdmin(null)
      setFormData({ name: '', title: '', facebook: '', zalo: '', tradeTag: '', level: 1 }) // ← reset có level
      setAvatarPreview(null)
      setAvatarFile(null)
    }
    setModalOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Ảnh phải nhỏ hơn 5MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.title || !formData.facebook || !formData.zalo || !formData.tradeTag) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    const fd = new FormData()
    fd.append('name', formData.name)
    fd.append('title', formData.title)
    fd.append('facebook', formData.facebook)
    fd.append('zalo', formData.zalo)
    fd.append('tradeTag', formData.tradeTag)
    fd.append('level', formData.level)  // ← gửi level lên server
    if (avatarFile) fd.append('avatar', avatarFile)

    setIsSubmitting(true)
    try {
      if (editAdmin) {
        await axios.put(`${API}/api/insurance/${editAdmin._id}`, fd, authHeaders)
        toast.success('Cập nhật thành công!')
      } else {
        await axios.post(`${API}/api/insurance`, fd, authHeaders)
        toast.success('Thêm thành công!')
      }
      setModalOpen(false)
      fetchAdmins()
    } catch (err) {
      if (err.response?.status === 401) return onLogout()
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa admin này?')) return
    try {
      await axios.delete(`${API}/api/insurance/${id}`, authHeaders)
      toast.success('Đã xóa thành công')
      fetchAdmins()
    } catch (err) {
      if (err.response?.status === 401) return onLogout()
      toast.error('Có lỗi xảy ra khi xóa')
    }
  }

  const LEVEL_LABELS = ['', 'Đồng', 'Bạc', 'Bạch Kim', 'Bạch Kim+', 'Vàng', 'Kim Cương']
  const LEVEL_COLORS = ['', '#cd7c3f', '#94a3b8', '#b0c4de', '#7ec8e3', '#f59e0b', '#a78bfa']

  return (
    <>
      <div className="page-header">
        <div>
          <h1>🛡️ Quản lý Bảo Hiểm GD</h1>
          <p>Thêm, sửa, xóa danh sách Admin bảo hiểm giao dịch</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          ➕ Thêm Admin
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="tbl-empty"><span className="spinner" /></div>
        ) : admins.length === 0 ? (
          <div className="tbl-empty">
            <div className="icon">📭</div>
            <p>Chưa có admin bảo hiểm nào.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Tên</th>
                <th>Level</th>
                <th>Chức danh</th>
                <th>Zalo</th>
                <th>Mua Bán</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td>
                    {admin.avatarUrl ? (
                      <img src={admin.avatarUrl} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div className="tbl-avatar-placeholder">{admin.name.charAt(0)}</div>
                    )}
                  </td>
                  <td><strong>{admin.name}</strong></td>
                  <td>
                    <span className="score-pill" style={{ background: LEVEL_COLORS[admin.level || 1], color: 'white' }}>
                      Lv.{admin.level || 1} {LEVEL_LABELS[admin.level || 1]}
                    </span>
                  </td>
                  <td><span className="score-pill" style={{ background: 'var(--primary)' }}>{admin.title}</span></td>
                  <td>{admin.zalo}</td>
                  <td><span className="score-pill" style={{ background: 'var(--success)', color: 'white' }}>{admin.tradeTag}</span></td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(admin)}>✏️ Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(admin._id)}>🗑️ Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ minWidth: 400 }}>
            <div className="modal-title">{editAdmin ? '✏️ Sửa Admin' : '➕ Thêm Admin'}</div>
            <form onSubmit={handleSubmit}>
              {/* Avatar */}
              <div className="form-group" style={{ textAlign: 'center' }}>
                <label className="file-label" style={{ display: 'inline-block', width: 'auto', padding: '10px 20px', cursor: 'pointer' }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 10 }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#333', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📷</div>
                  )}
                  <div>Chọn Avatar</div>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </label>
              </div>

              {/* Level — select 1-6 */}
              <div className="form-group">
                <label>Level (1-6)</label>
                <select
                  value={formData.level}
                  onChange={e => setFormData({ ...formData, level: parseInt(e.target.value, 10) })}
                >
                  <option value={1}>Lv.1 — Đồng</option>
                  <option value={2}>Lv.2 — Bạc</option>
                  <option value={3}>Lv.3 — Bạch Kim</option>
                  <option value={4}>Lv.4 — Bạch Kim+</option>
                  <option value={5}>Lv.5 — Vàng</option>
                  <option value={6}>Lv.6 — Kim Cương (cao nhất)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tên Admin</label>
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="VD: SoiXam ( CEO )" required />
              </div>
              <div className="form-group">
                <label>Chức danh / Badge (màu xanh dương)</label>
                <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="VD: Bảo Vệ GD < 999m" required />
              </div>
              <div className="form-group">
                <label>Link Facebook</label>
                <input value={formData.facebook} onChange={e => setFormData({ ...formData, facebook: e.target.value })} placeholder="https://facebook.com/..." required />
              </div>
              <div className="form-group">
                <label>Số Zalo</label>
                <input value={formData.zalo} onChange={e => setFormData({ ...formData, zalo: e.target.value })} placeholder="VD: 0345655513" required />
              </div>
              <div className="form-group">
                <label>Tag Mua Bán (màu xanh ngọc)</label>
                <input value={formData.tradeTag} onChange={e => setFormData({ ...formData, tradeTag: e.target.value })} placeholder="VD: Poke đại chiến" required />
              </div>

              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)} disabled={isSubmitting}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : '💾 Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
