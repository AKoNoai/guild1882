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

export default function Dashboard({ token, onLogout }) {
  const [page, setPage]             = useState('scores')   // 'scores' | 'poster'
  const [scores, setScores]         = useState([])
  const [filtered, setFiltered]     = useState([])
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState([])         // selected IDs
  const [editModal, setEditModal]   = useState(null)       // score obj to edit
  const [deleteModal, setDeleteModal] = useState(null)     // id to delete
  const [bulkModal, setBulkModal]   = useState(false)
  const [viewImage, setViewImage]   = useState(null)

  // Poster state
  const [poster, setPoster]         = useState(null)
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreview, setPosterPreview] = useState(null)
  const [posterLoading, setPosterLoading] = useState(false)

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  /* ── Fetch scores ── */
  const fetchScores = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/api/scores`)
      setScores(data)
      setFiltered(data)
    } catch { toast.error('Lỗi tải dữ liệu') }
    finally { setLoading(false) }
  }, [])

  /* ── Fetch poster ── */
  const fetchPoster = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/poster`)
      setPoster(data)
    } catch {}
  }, [])

  useEffect(() => { fetchScores(); fetchPoster() }, [fetchScores, fetchPoster])

  /* ── Search filter ── */
  useEffect(() => {
    const q = search.toLowerCase().trim()
    setFiltered(q ? scores.filter(s => s.name.toLowerCase().includes(q)) : scores)
    setSelected([])
  }, [search, scores])

  /* ── Select All ── */
  const allSelected = filtered.length > 0 && selected.length === filtered.length
  const toggleAll   = () => setSelected(allSelected ? [] : filtered.map(s => s._id))
  const toggleOne   = (id) => setSelected(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])

  /* ── Edit ── */
  const [editName, setEditName]   = useState('')
  const [editScore, setEditScore] = useState('')

  const openEdit = (s) => {
    setEditModal(s)
    setEditName(s.name)
    setEditScore(s.score)
  }

  const handleEdit = async () => {
    if (!editName.trim()) { toast.error('Tên không được để trống'); return }
    try {
      await axios.put(`${API}/api/scores/${editModal._id}`, { name: editName, score: editScore }, authHeaders)
      toast.success('✅ Đã cập nhật!')
      setEditModal(null)
      fetchScores()
    } catch (err) {
      if (err.response?.status === 401) return onLogout();
      toast.error(err.response?.data?.message || 'Lỗi cập nhật')
    }
  }

  /* ── Delete 1 ── */
  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/api/scores/${deleteModal}`, authHeaders)
      toast.success('🗑️ Đã xóa!')
      setDeleteModal(null)
      fetchScores()
    } catch (err) {
      if (err.response?.status === 401) return onLogout();
      toast.error('Lỗi xóa')
    }
  }

  /* ── Bulk delete ── */
  const handleBulkDelete = async () => {
    try {
      await axios.delete(`${API}/api/scores/bulk`, { ...authHeaders, data: { ids: selected } })
      toast.success(`🗑️ Đã xóa ${selected.length} mục!`)
      setBulkModal(false)
      setSelected([])
      fetchScores()
    } catch (err) {
      if (err.response?.status === 401) return onLogout();
      toast.error('Lỗi xóa hàng loạt')
    }
  }

  /* ── Upload poster ── */
  const handlePosterFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Ảnh phải nhỏ hơn 10MB'); return }
    setPosterFile(file)
    setPosterPreview(URL.createObjectURL(file))
  }

  const handlePosterUpload = async () => {
    if (!posterFile) { toast.error('Chọn ảnh trước'); return }
    const fd = new FormData()
    fd.append('image', posterFile)
    try {
      setPosterLoading(true)
      await axios.post(`${API}/api/poster`, fd, authHeaders)
      toast.success('🎨 Đã cập nhật poster!')
      setPosterFile(null)
      setPosterPreview(null)
      fetchPoster()
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn, vui lòng tải lại trang hoặc đăng nhập lại');
        onLogout();
      } else {
        toast.error('Lỗi upload poster');
      }
    }
    finally { setPosterLoading(false) }
  }

  const totalScore = scores.reduce((a, s) => a + s.score, 0)
  const topScore   = scores.length ? scores[0].score : 0

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⚔️</span>
          <h2>Guild1882</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${page === 'scores' ? 'active' : ''}`} onClick={() => setPage('scores')}>
            <span className="nav-icon">🏆</span> Quản lý Điểm
          </button>
          <button className={`nav-item ${page === 'poster' ? 'active' : ''}`} onClick={() => setPage('poster')}>
            <span className="nav-icon">🎨</span> Quản lý Poster
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        {page === 'scores' && (
          <>
            <div className="page-header">
              <div>
                <h1>🏆 Quản lý Điểm</h1>
                <p>Xem, sửa, xóa và lọc dữ liệu người chơi</p>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <div><div className="stat-label">Tổng người</div><div className="stat-value">{scores.length}</div></div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🎯</span>
                <div><div className="stat-label">Cao nhất</div><div className="stat-value">{topScore.toLocaleString()}</div></div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <div><div className="stat-label">Tổng điểm</div><div className="stat-value">{totalScore.toLocaleString()}</div></div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✅</span>
                <div><div className="stat-label">Đã chọn</div><div className="stat-value">{selected.length}</div></div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
              <input
                className="search-input"
                placeholder="🔍  Tìm theo tên..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="search-scores"
              />
              {selected.length > 0 && (
                <button className="btn btn-danger" onClick={() => setBulkModal(true)}>
                  🗑️ Xóa {selected.length} mục
                </button>
              )}
            </div>

            {/* Table */}
            <div className="table-wrapper">
              {loading ? (
                <div className="tbl-empty"><span className="spinner" /></div>
              ) : filtered.length === 0 ? (
                <div className="tbl-empty">
                  <div className="icon">📭</div>
                  <p>{search ? 'Không tìm thấy kết quả.' : 'Chưa có dữ liệu.'}</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="check-cell">
                        <input type="checkbox" id="select-all" checked={allSelected} onChange={toggleAll} />
                      </th>
                      <th>#</th>
                      <th>Người chơi</th>
                      <th>Điểm</th>
                      <th>Ngày gửi</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s._id} className={selected.includes(s._id) ? 'selected-row' : ''}>
                        <td className="check-cell">
                          <input
                            type="checkbox"
                            checked={selected.includes(s._id)}
                            onChange={() => toggleOne(s._id)}
                          />
                        </td>
                        <td style={{ color: 'var(--muted)', fontWeight: 700 }}>{i + 1}</td>
                        <td>
                          <div className="tbl-avatar-wrap">
                            {s.imageUrl
                              ? <img
                                  src={s.imageUrl}
                                  alt={s.name}
                                  className="tbl-avatar clickable-avatar"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewImage({ url: s.imageUrl, name: s.name });
                                  }}
                                />
                              : <div className="tbl-avatar-placeholder">{s.name.charAt(0).toUpperCase()}</div>
                            }
                            <span className="tbl-name">{s.name}</span>
                          </div>
                        </td>
                        <td><span className="score-pill">{s.score.toLocaleString()}</span></td>
                        <td>
                          <span className="date-text">
                            {new Date(s.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️ Sửa</button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(s._id)}>🗑️ Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── Poster Page ── */}
        {page === 'poster' && (
          <>
            <div className="page-header">
              <div>
                <h1>🎨 Quản lý Poster</h1>
                <p>Upload poster sự kiện hiển thị trên bảng xếp hạng</p>
              </div>
            </div>

            <div className="poster-section">
              <h3>📌 Poster hiện tại</h3>
              <div className="poster-preview">
                {poster?.imageUrl
                  ? <img src={poster.imageUrl} alt="Poster" className="poster-img" />
                  : <div className="poster-no-img"><span>🖼️</span><span>Chưa có poster</span></div>
                }
                <div className="poster-info">
                  {poster?.createdAt && (
                    <p>Ngày upload: {new Date(poster.createdAt).toLocaleString('vi-VN')}</p>
                  )}
                  <p>Poster sẽ hiển thị khi user nhấn "Xem Poster" trên bảng xếp hạng.</p>
                </div>
              </div>
            </div>

            <div className="poster-section">
              <h3>⬆️ Upload Poster Mới</h3>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="file-label" htmlFor="poster-file">
                  {posterPreview
                    ? <img src={posterPreview} alt="preview" style={{ maxHeight: 160, borderRadius: 8 }} />
                    : <>
                        <span className="file-icon">🖼️</span>
                        <strong style={{ color: 'var(--primary)' }}>Chọn ảnh poster</strong>
                        <span>PNG, JPG, WEBP · Tối đa 10MB</span>
                      </>
                  }
                  <input id="poster-file" type="file" accept="image/*" onChange={handlePosterFile} />
                </label>
              </div>
              <button
                className="btn btn-accent"
                onClick={handlePosterUpload}
                disabled={posterLoading || !posterFile}
              >
                {posterLoading
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Đang upload...</>
                  : '🚀 Upload Poster'
                }
              </button>
            </div>
          </>
        )}
      </main>

      {/* ── Edit Modal ── */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">✏️ Chỉnh sửa người chơi</div>
            <div className="form-group">
              <label htmlFor="edit-name">Tên</label>
              <input id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="edit-score">Điểm</label>
              <input id="edit-score" type="number" value={editScore} onChange={e => setEditScore(e.target.value)} min={0} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleEdit}>💾 Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete 1 Modal ── */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🗑️ Xác nhận xóa</div>
            <div className="bulk-warning">
              Bạn có chắc muốn xóa người chơi này? Hành động không thể hoàn tác.
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteModal(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDelete}>🗑️ Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Delete Modal ── */}
      {bulkModal && (
        <div className="modal-overlay" onClick={() => setBulkModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">⚠️ Xóa hàng loạt</div>
            <div className="bulk-warning">
              Bạn sắp xóa <strong>{selected.length}</strong> người chơi. Hành động này không thể hoàn tác!
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setBulkModal(false)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleBulkDelete}>🗑️ Xóa tất cả</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Viewer Modal ── */}
      {viewImage && (
        <div className="modal-overlay image-viewer-overlay" onClick={() => setViewImage(null)}>
          <div className="image-viewer-content" onClick={e => e.stopPropagation()}>
            <div className="image-viewer-header">
              <h3>📸 Ảnh của {viewImage.name}</h3>
              <button className="modal-close" onClick={() => setViewImage(null)}>✕</button>
            </div>
            <div className="image-viewer-body">
              <img src={viewImage.url} alt={viewImage.name} className="viewer-img" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
