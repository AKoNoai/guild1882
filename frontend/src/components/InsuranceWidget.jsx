import { useState, useEffect } from 'react';
import axios from 'axios';

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

export default function InsuranceWidget() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const { data } = await axios.get(`${API}/api/insurance`);
        setAdmins(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  if (loading) {
    return <div className="loading-spinner"><span className="spinner"></span></div>;
  }

  return (
    <div className="insurance-widget fade-in">
      <h2 className="insurance-heading">DANH SÁCH CÁC ADMIN BẢO HIỂM GD</h2>

      <div className="insurance-grid">
        {admins.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Chưa có Admin Bảo Hiểm GD nào.</p>
        )}
        {admins.map((admin) => (
          <div key={admin._id} className="insurance-card">
            {/* The diagonal red/gray background */}
            <div className="insurance-banner">
              <div className="insurance-banner-shape"></div>
            </div>

            {/* Avatar overlapping the banner */}
            <div className={`insurance-avatar-wrapper level-${admin.level || 1}`}>
              <div className="frame-overlay"></div>
              {admin.avatarUrl ? (
                <img src={admin.avatarUrl} alt={admin.name} className="insurance-avatar" />
              ) : (
                <div className="insurance-avatar-placeholder">{admin.name.charAt(0)}</div>
              )}
              <div className="level-badge">Lv {admin.level || 1}</div>
            </div>

            {/* Details */}
            <div className="insurance-content">
              <div className="insurance-row">
                <div className="insurance-label"><i className="fa-solid fa-user"></i> Tên:</div>
                <div className="insurance-value">
                  <span className="insurance-badge">{admin.name}</span>
                </div>
              </div>

              <div className="insurance-row">
                <div className="insurance-label"><i className="fa-brands fa-facebook"></i> Facebook:</div>
                <div className="insurance-value">
                  <a href={admin.facebook} target="_blank" rel="noopener noreferrer" className="insurance-link">
                    {admin.facebook}
                  </a>
                </div>
              </div>

              <div className="insurance-row">
                <div className="insurance-label"><i className="fa-solid fa-comment-dots"></i> Zalo:</div>
                <div className="insurance-value" style={{ color: '#0084ff' }}>
                  {admin.zalo}
                </div>
              </div>

              <div className="insurance-row">
                <div className="insurance-label"><i className="fa-solid fa-cart-shopping"></i> Mua bán:</div>
                <div className="insurance-value">
                  <span className="insurance-tag">{admin.tradeTag}</span>
                </div>
              </div>

              <div className="insurance-contact">
                <a href={admin.facebook} target="_blank" rel="noopener noreferrer" className="insurance-btn">
                  <span className="pokeball-icon"></span> Liên hệ
                </a>
                <div className="insurance-verified-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#e0f2f1" stroke="#26a69a" />
                    <polyline points="9 12 11 14 15 10" stroke="#26a69a" strokeWidth="3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
