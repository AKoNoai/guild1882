import { useState } from 'react'

export default function Leaderboard({ scores, loading, poster, onOpenPoster }) {
  const [viewImage, setViewImage] = useState(null)

  const rankIcon = (i) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `#${i + 1}`
  }
  const rankClass = (i) => {
    if (i === 0) return 'rank-1'
    if (i === 1) return 'rank-2'
    if (i === 2) return 'rank-3'
    return ''
  }

  return (
    <section className="leaderboard-section">
      <div className="section-header">
        <h2>🏆 Bảng Xếp Hạng</h2>
        {poster && (
          <button className="poster-btn" onClick={onOpenPoster}>
            🎁 Xem Quà Guild
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <span>Đang tải...</span>
          </div>
        ) : scores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>Chưa có ai gửi điểm. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <table className="score-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Hạng</th>
                <th>Người chơi</th>
                <th>Điểm</th>
                <th>Ngày gửi</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={s._id}>
                  <td className={`rank-cell ${rankClass(i)}`}>{rankIcon(i)}</td>
                  <td>
                    <div className="user-cell">
                      {s.imageUrl
                        ? <img
                            src={s.imageUrl}
                            alt={s.name}
                            className="avatar clickable-avatar"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewImage({ url: s.imageUrl, name: s.name });
                            }}
                          />
                        : <div className="avatar-placeholder">{s.name.charAt(0).toUpperCase()}</div>
                      }
                      <span className="user-name">{s.name}</span>
                    </div>
                  </td>
                  <td><span className="score-badge">{s.score.toLocaleString()}</span></td>
                  <td style={{ color: 'var(--color-muted)', fontSize: 13 }}>
                    {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Top 3 Stats */}
      {scores.length >= 1 && !loading && (
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {scores.slice(0, 3).map((s, i) => (
            <div key={s._id} style={{
              flex: '1 1 200px',
              background: 'var(--bg-card)',
              border: `1px solid ${i === 0 ? 'rgba(251,191,36,0.3)' : i === 1 ? 'rgba(148,163,184,0.3)' : 'rgba(205,124,63,0.3)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ fontSize: 28 }}>{['🥇','🥈','🥉'][i]}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                <div style={{ color: 'var(--color-green)', fontWeight: 700 }}>{s.score.toLocaleString()} điểm</div>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </section>
  )
}
