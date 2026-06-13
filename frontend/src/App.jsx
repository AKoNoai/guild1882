import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import ScoreForm from './components/ScoreForm'
import Leaderboard from './components/Leaderboard'
import PosterModal from './components/PosterModal'
import WeatherWidget from './components/WeatherWidget'
import ProfileWidget from './components/ProfileWidget'
import InsuranceWidget from './components/InsuranceWidget'
import NotificationModal from './components/NotificationModal'
import axios from 'axios'

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

export default function App() {
  const [tab, setTab] = useState(() => localStorage.getItem('activeTab') || 'leaderboard')
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [posterOpen, setPosterOpen] = useState(false)
  const [poster, setPoster] = useState(null)
  const [submissionsOpen, setSubmissionsOpen] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  
  // Loading screen states
  const [initialLoading, setInitialLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('activeTab', tab)
  }, [tab])

  const fetchSubmissionsStatus = async () => {
    try {
      const { data } = await axios.get(`${API}/api/scores/status`)
      setSubmissionsOpen(data.open)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchScores = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/api/scores`)
      setScores(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      // trigger fade out loading screen
      setFadeOut(true)
      setTimeout(() => setInitialLoading(false), 500)
    }
  }

  const fetchPoster = async () => {
    try {
      const { data } = await axios.get(`${API}/api/poster`)
      setPoster(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchScores()
    fetchPoster()
    fetchSubmissionsStatus()
  }, [])

  useEffect(() => {
    if (tab === 'submit') {
      fetchSubmissionsStatus()
    }
  }, [tab])

  return (
    <div className="app">
      {initialLoading && (
        <div className={`global-loading-screen ${fadeOut ? 'fade-out' : ''}`}>
          <img src="/pikachuchay.gif" alt="Loading..." className="loading-gif" onError={(e) => { e.target.style.display='none' }} />
          <div className="loading-text">Đang tải dữ liệu...</div>
        </div>
      )}

      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e1e3a', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.3)' }
      }} />

      <div className="container" style={{ paddingTop: '20px' }}>
        <div className="tabs-container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="tab-btn"
              style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {theme === 'dark' ? <><i className="fa-solid fa-sun"></i> Sáng</> : <><i className="fa-solid fa-moon"></i> Tối</>}
            </button>
          </div>
          {/* Desktop tabs - hidden on mobile */}
          <div className="tabs desktop-tabs">
            <button
              className={`tab-btn ${tab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setTab('leaderboard')}
            >
              🏆 Bảng Xếp Hạng
            </button>
            <button
              className={`tab-btn ${tab === 'submit' ? 'active' : ''}`}
              onClick={() => setTab('submit')}
            >
              📤 Gửi Điểm
            </button>
            <button
              className={`tab-btn ${tab === 'weather' ? 'active' : ''}`}
              onClick={() => setTab('weather')}
            >
              🌤️ Thời Tiết
            </button>
            <button
              className={`tab-btn ${tab === 'profile' ? 'active' : ''}`}
              onClick={() => setTab('profile')}
            >
              📋 Profile
            </button>
            <button
              className={`tab-btn ${tab === 'insurance' ? 'active' : ''}`}
              onClick={() => setTab('insurance')}
            >
              🛡️ Bảo hiểm GD
            </button>
          </div>
        </div>
      </div>


      <div className="container main-content-area">


        {tab === 'leaderboard' && (
          <Leaderboard
            scores={scores}
            loading={loading}
            poster={poster}
            onOpenPoster={() => setPosterOpen(true)}
          />
        )}

        {tab === 'submit' && (
          <ScoreForm
            submissionsOpen={submissionsOpen}
            onSuccess={() => {
              fetchScores()
              setTab('leaderboard')
            }}
          />
        )}

        {tab === 'weather' && (
          <WeatherWidget />
        )}

        {tab === 'profile' && (
          <ProfileWidget />
        )}

        {tab === 'insurance' && (
          <InsuranceWidget />
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          className={`bottom-nav-item ${tab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setTab('leaderboard')}
        >
          <i className="fa-solid fa-trophy"></i>
          <span>XẾP HẠNG</span>
        </button>
        <button
          className={`bottom-nav-item ${tab === 'submit' ? 'active' : ''}`}
          onClick={() => setTab('submit')}
        >
          <i className="fa-solid fa-paper-plane"></i>
          <span>GỬI ĐIỂM</span>
        </button>
        <button
          className={`bottom-nav-item ${tab === 'weather' ? 'active' : ''}`}
          onClick={() => setTab('weather')}
        >
          <i className="fa-solid fa-cloud-sun"></i>
          <span>THỜI TIẾT</span>
        </button>
        <button
          className={`bottom-nav-item ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => setTab('profile')}
        >
          <i className="fa-solid fa-id-card"></i>
          <span>PROFILE</span>
        </button>
        <button
          className={`bottom-nav-item ${tab === 'insurance' ? 'active' : ''}`}
          onClick={() => setTab('insurance')}
        >
          <i className="fa-solid fa-shield-halved"></i>
          <span>BẢO HIỂM</span>
        </button>
      </nav>

      <PosterModal
        open={posterOpen}
        poster={poster}
        onClose={() => setPosterOpen(false)}
      />
      <NotificationModal />
    </div>
  )
}
