import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '')
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'dark')
  const [initialLoading, setInitialLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('adminTheme', theme)
  }, [theme])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => setInitialLoading(false), 500)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = (t) => {
    localStorage.setItem('adminToken', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken('')
  }

  return (
    <>
      {initialLoading && (
        <div className={`global-loading-screen ${fadeOut ? 'fade-out' : ''}`}>
          <img src="/pikachuchay.gif" alt="Loading..." className="loading-gif" onError={(e) => { e.target.style.display='none' }} />
          <div className="loading-text">Đang tải dữ liệu...</div>
        </div>
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e3a',
            color: '#e2e8f0',
            border: '1px solid rgba(99,102,241,0.3)',
            fontFamily: 'Outfit, sans-serif'
          }
        }}
      />
      {token
        ? <Dashboard token={token} onLogout={handleLogout} theme={theme} setTheme={setTheme} />
        : <Login onLogin={handleLogin} />
      }
    </>
  )
}
