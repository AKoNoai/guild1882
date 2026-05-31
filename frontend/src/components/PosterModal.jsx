export default function PosterModal({ open, poster, onClose }) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎨 Poster Sự Kiện</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {poster?.imageUrl
          ? <img src={poster.imageUrl} alt="Poster" className="modal-poster-img" />
          : <div className="modal-no-poster">Chưa có poster nào được đăng.</div>
        }
      </div>
    </div>
  )
}
