import { useState } from 'react'
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

export default function ScoreForm({ onSuccess }) {
  const [name, setName]       = useState('')
  const [score, setScore]     = useState('')
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh phải nhỏ hơn 5MB')
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Vui lòng nhập tên'); return }
    if (score === '') { toast.error('Vui lòng nhập điểm'); return }

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('score', score)
    if (image) formData.append('image', image)

    try {
      setLoading(true)
      await axios.post(`${API}/api/scores`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('🎉 Gửi điểm thành công!')
      setName(''); setScore(''); setImage(null); setPreview(null)
      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi thất bại, thử lại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="form-section">
      <div className="card">
        <h2>📤 Gửi Điểm Của Bạn</h2>
        <p>Điền thông tin và ảnh đại diện để gửi lên bảng xếp hạng</p>

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div className="form-group">
            <label>Ảnh Điểm Guild Chiến (tùy chọn)</label>
            <label className="file-upload-label" htmlFor="avatar-input">
              {preview
                ? <img src={preview} alt="Preview" className="preview-img" />
                : <>
                    <span className="upload-icon">🖼️</span>
                    <strong>Chọn ảnh</strong>
                    <span>PNG, JPG, WEBP · Tối đa 5MB</span>
                  </>
              }
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleFile}
              />
            </label>
          </div>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name-input">Tên của bạn</label>
            <input
              id="name-input"
              type="text"
              placeholder="Nhập tên..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              required
            />
          </div>

          {/* Score */}
          <div className="form-group">
            <label htmlFor="score-input">Điểm số</label>
            <input
              id="score-input"
              type="number"
              placeholder="Nhập điểm..."
              value={score}
              onChange={e => setScore(e.target.value)}
              min={0}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Đang gửi...</>
              : '🚀 Gửi Điểm'
            }
          </button>
        </form>
      </div>
    </section>
  )
}
