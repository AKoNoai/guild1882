import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_API_URL || ''

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) { toast.error('Nhập đầy đủ thông tin'); return }
    try {
      setLoading(true)
      const { data } = await axios.post(`${API}/api/admin/login`, { username, password })
      toast.success('✅ Đăng nhập thành công!')
      onLogin(data.token)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sai tài khoản hoặc mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <span className="logo-icon">⚔️</span>
          <h1>Guild1882 Admin</h1>
          <p>Bảng quản trị – chỉ dành cho Admin</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-username">Tên đăng nhập</label>
            <input
              id="admin-username"
              type="text"
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--muted)', cursor: 'pointer', fontSize: 16
                }}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Đang đăng nhập...</>
              : '🔐 Đăng nhập'
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--muted)' }}>
          Khu vực bảo mật · Guild 1882 © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
