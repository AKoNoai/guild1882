import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '')

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
        ? <Dashboard token={token} onLogout={handleLogout} />
        : <Login onLogin={handleLogin} />
      }
    </>
  )
}
