import { useState, useEffect } from 'react'

export default function NotificationModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hideUntil = localStorage.getItem('hideNotificationUntil')
    if (!hideUntil || Date.now() > parseInt(hideUntil, 10)) {
      // Small delay to make it feel like a popup after load
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleHideFor2Hours = () => {
    const hideUntil = Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    localStorage.setItem('hideNotificationUntil', hideUntil.toString())
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose} style={{ zIndex: 9999 }}>
      <div className="modal-content notification-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: 0, overflow: 'hidden' }}>
        <div className="modal-header" style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-bullhorn" style={{ color: '#3b82f6' }}></i> Thông báo
          </h3>
          <button className="close-btn" onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'inherit', padding: '0 5px' }}>&times;</button>
        </div>
        
        <div className="modal-body" style={{ padding: '25px 20px', textAlign: 'center', lineHeight: '1.8' }}>
          <h4 style={{ color: '#ef4444', margin: '0 0 15px 0', fontSize: '1.3rem', textTransform: 'uppercase' }}>
            🎁 Luật Quà Guild 🎁
          </h4>
          
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', padding: '15px', marginBottom: '15px', textAlign: 'left', display: 'inline-block', width: '100%', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <p style={{ margin: '8px 0', fontSize: '1.05rem' }}>1. <strong style={{ color: '#10b981' }}>50 – 99 điểm:</strong> 1 quà</p>
            <p style={{ margin: '8px 0', fontSize: '1.05rem' }}>2. <strong style={{ color: '#3b82f6' }}>100 – 199 điểm:</strong> 2 quà</p>
            <p style={{ margin: '8px 0', fontSize: '1.05rem' }}>3. <strong style={{ color: '#8b5cf6' }}>200 – 999 điểm:</strong> 3 – 4 quà</p>
          </div>
          
          <p style={{ margin: '15px 0 0 0', fontStyle: 'italic', color: '#fbbf24', fontWeight: 'bold', fontSize: '1.1rem' }}>
            ⚠️ Lưu ý: Gửi điểm sớm nhất có thể
          </p>
        </div>

        <div className="modal-footer" style={{ padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
          <button 
            onClick={handleHideFor2Hours}
            style={{ 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.2s',
              fontSize: '0.95rem'
            }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            Không hiển thị lại trong 2 giờ
          </button>
        </div>
      </div>
    </div>
  )
}
