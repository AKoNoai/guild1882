import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import InsuranceAdminPanel from './InsuranceAdminPanel'

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

const ICON_MAP = {
  facebook: 'fa-brands fa-facebook',
  youtube: 'fa-brands fa-youtube',
  zalo: 'fa-solid fa-comment-dots',
  android: 'fa-brands fa-android',
  ios: 'fa-brands fa-apple',
  link: 'fa-solid fa-link',
  group: 'fa-solid fa-users',
  gift: 'fa-solid fa-gift',
  messenger: 'fa-brands fa-facebook-messenger',
  game: 'fa-solid fa-gamepad',
};

export default function Dashboard({ token, onLogout }) {
  const [page, setPage] = useState('scores')   // 'scores' | 'poster' | 'profile'
  const [scores, setScores] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])         // selected IDs
  const [editModal, setEditModal] = useState(null)       // score obj to edit
  const [deleteModal, setDeleteModal] = useState(null)     // id to delete
  const [bulkModal, setBulkModal] = useState(false)
  const [viewImage, setViewImage] = useState(null)
  const [submissionsOpen, setSubmissionsOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Poster state
  const [poster, setPoster] = useState(null)
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreview, setPosterPreview] = useState(null)
  const [posterLoading, setPosterLoading] = useState(false)

  // Profile state
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [addSectionTitle, setAddSectionTitle] = useState('')
  const [addItemModal, setAddItemModal] = useState(null)   // sectionId
  const [editItemModal, setEditItemModal] = useState(null)  // { sectionId, item }
  const [editSectionModal, setEditSectionModal] = useState(null) // section obj
  const [itemForm, setItemForm] = useState({ label: '', buttonText: '', buttonUrl: '', buttonColor: 'blue', buttonIcon: 'link' })

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
    } catch { }
  }, [])

  /* ── Fetch submissions status ── */
  const fetchSubmissionsStatus = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/scores/status`)
      setSubmissionsOpen(data.open)
    } catch { }
  }, [])

  useEffect(() => { fetchScores(); fetchPoster(); fetchSubmissionsStatus(); fetchProfile() }, [fetchScores, fetchPoster, fetchSubmissionsStatus])

  /* ── Fetch profile ── */
  const fetchProfile = async () => {
    try {
      setProfileLoading(true)
      const { data } = await axios.get(`${API}/api/profile`)
      setProfile(data)
    } catch { }
    finally { setProfileLoading(false) }
  }

  /* ── Profile: Add Section ── */
  const handleAddSection = async () => {
    if (!addSectionTitle.trim()) { toast.error('Tiêu đề không được để trống'); return }
    try {
      const { data } = await axios.post(`${API}/api/profile/section`, { title: addSectionTitle }, authHeaders)
      setProfile(data)
      setAddSectionTitle('')
      toast.success('✅ Đã thêm section!')
    } catch (err) {
      if (err.response?.status === 401) return onLogout()
      toast.error('Lỗi thêm section')
    }
  }

  /* ── Profile: Edit Section Title ── */
  const handleEditSection = async () => {
    if (!editSectionModal) return
    try {
      const { data } = await axios.put(`${API}/api/profile/section/${editSectionModal._id}`, { title: editSectionModal.title }, authHeaders)
      setProfile(data)
      setEditSectionModal(null)
      toast.success('✅ Đã cập nhật!')
    } catch (err) {
      if (err.response?.status === 401) return onLogout()
      toast.error('Lỗi cập nhật section')
    }
  }

  /* ── Profile: Delete Section ── */
  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Xóa section này và tất cả item bên trong?')) return
    try {
      const { data } = await axios.delete(`${API}/api/profile/section/${sectionId}`, authHeaders)
      setProfile(data)
      toast.success('🗑️ Đã xóa section!')
    } catch (err) {
      if (err.response?.status === 401) return onLogout()
      toast.error('Lỗi xóa section')
    }
  }

  /* ── Profile: Add Item ── */
  const handleAddItem = async () => {
    if (!itemForm.label.trim() || !itemForm.buttonText.trim()) { toast.error('Label và Tên nút là bắt buộc'); return }
    try {
      const { data } = await axios.post(`${API}/api/profile/section/${addItemModal}/item`, itemForm, authHeaders)
      setProfile(data)
      setAddItemModal(null)
      setItemForm({ label: '', buttonText: '', buttonUrl: '', buttonColor: 'blue', buttonIcon: 'link' })
      toast.success('✅ Đã thêm item!')
    } catch (err) {
      if (err.response?.status === 401) return onLogout()
      toast.error('Lỗi thêm item')
    }
  }

  /* ── Profile: Edit Item ── */
  const handleEditItem = async () => {
    if (!editItemModal) return
    try {
      const { data } = await axios.put(
        `${API}/api/profile/section/${editItemModal.sectionId}/item/${editItemModal.item._id}`,
        itemForm, authHeaders
      )
      setProfile(data)
      setEditItemModal(null)
      setItemForm({ label: '', buttonText: '', buttonUrl: '', buttonColor: 'blue', buttonIcon: 'link' })
      toast.success('✅ Đã cập nhật!')
    } catch (err) {
      if (err.response?.status === 401) return onLogout()
      toast.error('Lỗi cập nhật item')
    }
  }

  /* ── Profile: Delete Item ── */
  const handleDeleteItem = async (sectionId, itemId) => {
    if (!window.confirm('Xóa item này?')) return
    try {
      const { data } = await axios.delete(`${API}/api/profile/section/${sectionId}/item/${itemId}`, authHeaders)
      setProfile(data)
      toast.success('🗑️ Đã xóa item!')
    } catch (err) {
      if (err.response?.status === 401) return onLogout()
      toast.error('Lỗi xóa item')
    }
  }

  /* ── Toggle Submissions ── */
  const toggleSubmissions = async () => {
    try {
      const nextState = !submissionsOpen
      const { data } = await axios.put(
        `${API}/api/admin/submissions-status`,
        { open: nextState },
        authHeaders
      )
      setSubmissionsOpen(data.open)
      toast.success(data.open ? '🔓 Đã mở cổng gửi điểm!' : '🔒 Đã đóng cổng gửi điểm!')
    } catch (err) {
      if (err.response?.status === 401) return onLogout();
      toast.error('Lỗi khi thay đổi trạng thái cổng gửi điểm')
    }
  }

  /* ── Search filter ── */
  useEffect(() => {
    const q = search.toLowerCase().trim()
    setFiltered(q ? scores.filter(s => s.name.toLowerCase().includes(q)) : scores)
    setSelected([])
  }, [search, scores])

  /* ── Select All ── */
  const allSelected = filtered.length > 0 && selected.length === filtered.length
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map(s => s._id))
  const toggleOne = (id) => setSelected(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])

  /* ── Edit ── */
  const [editName, setEditName] = useState('')
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

  const handleDeletePoster = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa poster hiện tại?')) return;
    try {
      setPosterLoading(true)
      await axios.delete(`${API}/api/poster`, authHeaders)
      toast.success('🗑️ Đã xóa poster!')
      setPoster(null)
    } catch (err) {
      if (err.response?.status === 401) return onLogout();
      toast.error('Lỗi khi xóa poster');
    } finally {
      setPosterLoading(false)
    }
  }


  const totalScore = scores.reduce((a, s) => a + s.score, 0)
  const topScore = scores.length ? scores[0].score : 0

  return (
    <div className="admin-layout">
      {/* ── Mobile Header ── */}
      <div className="mobile-header">
        <div className="mobile-brand">
          <span className="brand-icon">⚔️</span>
          <h2>Gửi điểm guild</h2>
        </div>
        <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
          ☰
        </button>
      </div>

      {/* ── Sidebar Overlay for Mobile ── */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">⚔️</span>
          <h2>Guild1882</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${page === 'scores' ? 'active' : ''}`} onClick={() => { setPage('scores'); setIsMobileMenuOpen(false); }}>
            <span className="nav-icon">🏆</span> Quản lý Điểm
          </button>
          <button className={`nav-item ${page === 'poster' ? 'active' : ''}`} onClick={() => { setPage('poster'); setIsMobileMenuOpen(false); }}>
            <span className="nav-icon">🎨</span> Quản lý Poster
          </button>
          <button className={`nav-item ${page === 'profile' ? 'active' : ''}`} onClick={() => { setPage('profile'); setIsMobileMenuOpen(false); }}>
            <span className="nav-icon">📋</span> Quản lý Profile
          </button>
          <button className={`nav-item ${page === 'insurance' ? 'active' : ''}`} onClick={() => { setPage('insurance'); setIsMobileMenuOpen(false); }}>
            <span className="nav-icon">🛡️</span> Bảo hiểm GD
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

              {/* Submission Toggle Widget */}
              <div className="submission-toggle-card">
                <span className={`status-dot ${submissionsOpen ? 'open' : 'closed'}`} />
                <span className="status-label">
                  Cổng gửi điểm: <strong className={submissionsOpen ? 'text-green' : 'text-red'}>{submissionsOpen ? 'ĐANG MỞ' : 'ĐANG ĐÓNG'}</strong>
                </span>
                <button
                  className={`btn btn-sm ${submissionsOpen ? 'btn-danger' : 'btn-primary'}`}
                  onClick={toggleSubmissions}
                >
                  {submissionsOpen ? '🔒 Đóng' : '🔓 Mở'}
                </button>
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
                  {poster && (
                    <div className="poster-actions" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById('poster-file').click()}>✏️ Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={handleDeletePoster}>🗑️ Xóa</button>
                    </div>
                  )}
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

        {/* ── Profile Page ── */}
        {page === 'profile' && (
          <>
            <div className="page-header">
              <div>
                <h1>📋 Quản lý Profile</h1>
                <p>Thêm các section và link hiển thị trên giao diện người dùng</p>
              </div>
            </div>

            {/* Add Section */}
            <div className="poster-section">
              <h3>➕ Thêm Section mới</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  className="search-input"
                  placeholder="Tiêu đề section (ví dụ: Các Kênh Youtube)"
                  value={addSectionTitle}
                  onChange={e => setAddSectionTitle(e.target.value)}
                  style={{ flex: 1, minWidth: 200 }}
                  onKeyDown={e => e.key === 'Enter' && handleAddSection()}
                />
                <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={handleAddSection}>➕ Thêm</button>
              </div>
            </div>

            {/* Sections List */}
            {profileLoading ? (
              <div className="tbl-empty"><span className="spinner" /></div>
            ) : (!profile?.sections || profile.sections.length === 0) ? (
              <div className="tbl-empty">
                <div className="icon">📋</div>
                <p>Chưa có section nào. Hãy thêm section đầu tiên!</p>
              </div>
            ) : (
              profile.sections.map(section => (
                <div key={section._id} className="poster-section" style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <h3>{section.title}</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setAddItemModal(section._id); setItemForm({ label: '', buttonText: '', buttonUrl: '', buttonColor: 'blue', buttonIcon: 'link' }) }}>➕ Thêm Item</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditSectionModal({ ...section })}>✏️ Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSection(section._id)}>🗑️ Xóa</button>
                    </div>
                  </div>

                  {section.items.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 10 }}>Chưa có item nào trong section này.</p>
                  ) : (
                    <div className="table-wrapper" style={{ marginTop: 12 }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Label</th>
                            <th>Tên nút</th>
                            <th>URL</th>
                            <th>Màu</th>
                            <th>Icon</th>
                            <th>Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.items.map(item => (
                            <tr key={item._id}>
                              <td>{item.label}</td>
                              <td><span className="score-pill">{item.buttonText}</span></td>
                              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <a href={item.buttonUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: 12 }}>{item.buttonUrl || '-'}</a>
                              </td>
                              <td><span className="score-pill" style={{ background: `var(--${item.buttonColor === 'blue' ? 'primary' : item.buttonColor === 'red' ? 'danger' : item.buttonColor})` }}>{item.buttonColor}</span></td>
                              <td>
                                {item.buttonIcon ? <><i className={ICON_MAP[item.buttonIcon] || 'fa-solid fa-link'} style={{ marginRight: 6 }}></i> {item.buttonIcon}</> : '-'}
                              </td>
                              <td>
                                <div className="actions-cell">
                                  <button className="btn btn-ghost btn-sm" onClick={() => {
                                    setEditItemModal({ sectionId: section._id, item })
                                    setItemForm({ label: item.label, buttonText: item.buttonText, buttonUrl: item.buttonUrl, buttonColor: item.buttonColor, buttonIcon: item.buttonIcon })
                                  }}>✏️ Sửa</button>
                                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(section._id, item._id)}>🗑️ Xóa</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {page === 'insurance' && (
          <InsuranceAdminPanel token={token} onLogout={onLogout} />
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

      {/* ── Profile: Edit Section Modal ── */}
      {editSectionModal && (
        <div className="modal-overlay" onClick={() => setEditSectionModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">✏️ Sửa Section</div>
            <div className="form-group">
              <label>Tiêu đề</label>
              <input
                value={editSectionModal.title}
                onChange={e => setEditSectionModal({ ...editSectionModal, title: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setEditSectionModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleEditSection}>💾 Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile: Add/Edit Item Modal ── */}
      {(addItemModal || editItemModal) && (
        <div className="modal-overlay" onClick={() => { setAddItemModal(null); setEditItemModal(null); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ minWidth: 400 }}>
            <div className="modal-title">{editItemModal ? '✏️ Sửa Item' : '➕ Thêm Item'}</div>
            
            <div className="form-group">
              <label>Label phụ (VD: Fanpage, Zalo Business)</label>
              <input
                value={itemForm.label}
                onChange={e => setItemForm({ ...itemForm, label: e.target.value })}
                placeholder="Ví dụ: Fanpage Poke"
              />
            </div>

            <div className="form-group">
              <label>Tên Nút (Text hiển thị trên nút)</label>
              <input
                value={itemForm.buttonText}
                onChange={e => setItemForm({ ...itemForm, buttonText: e.target.value })}
                placeholder="Ví dụ: Thangtinshop"
              />
            </div>

            <div className="form-group">
              <label>Đường dẫn URL (Link khi bấm vào)</label>
              <input
                value={itemForm.buttonUrl}
                onChange={e => setItemForm({ ...itemForm, buttonUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Màu sắc Nút</label>
                <select
                  value={itemForm.buttonColor}
                  onChange={e => setItemForm({ ...itemForm, buttonColor: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  <option value="blue">Xanh dương (Blue)</option>
                  <option value="red">Đỏ (Red)</option>
                  <option value="green">Xanh lá (Green)</option>
                  <option value="yellow">Vàng (Yellow)</option>
                  <option value="purple">Tím (Purple)</option>
                  <option value="gray">Xám (Gray)</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Icon</label>
                <select
                  value={itemForm.buttonIcon}
                  onChange={e => setItemForm({ ...itemForm, buttonIcon: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  <option value="link">🔗 Link</option>
                  <option value="facebook">📘 Facebook</option>
                  <option value="youtube">▶️ Youtube</option>
                  <option value="zalo">💬 Zalo</option>
                  <option value="messenger">💭 Messenger</option>
                  <option value="group">👥 Group</option>
                  <option value="gift">🎁 Quà tặng</option>
                  <option value="android">🤖 Android</option>
                  <option value="ios">🍎 iOS</option>
                  <option value="game">🎮 Game</option>
                </select>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => { setAddItemModal(null); setEditItemModal(null); }}>Hủy</button>
              <button className="btn btn-primary" onClick={editItemModal ? handleEditItem : handleAddItem}>
                {editItemModal ? '💾 Lưu' : '➕ Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
