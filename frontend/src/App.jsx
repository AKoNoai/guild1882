import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import ScoreForm from './components/ScoreForm'
import Leaderboard from './components/Leaderboard'
import PosterModal from './components/PosterModal'
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
  const [tab, setTab] = useState('leaderboard')
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [posterOpen, setPosterOpen] = useState(false)
  const [poster, setPoster] = useState(null)

  const fetchScores = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/api/scores`)
      setScores(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
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
  }, [])

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e1e3a', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.3)' }
      }} />

      <header className="header">
        <div className="container">
          <div className="header-badge">⚔️ Guild 1882</div>
          <h1>Bảng Xếp Hạng</h1>
          <p>Gửi điểm của bạn và cạnh tranh với mọi người</p>
        </div>
      </header>

      <div className="container">
        <div className="tabs">
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
        </div>

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
            onSuccess={() => {
              fetchScores()
              setTab('leaderboard')
            }}
          />
        )}
      </div>

      <PosterModal
        open={posterOpen}
        poster={poster}
        onClose={() => setPosterOpen(false)}
      />
    </div>
  )
}
