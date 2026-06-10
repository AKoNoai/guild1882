import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ICON_MAP = {
  facebook: 'fa-brands fa-facebook',
  youtube: 'fa-brands fa-youtube',
  zalo: 'fa-solid fa-comment-dots',
  android: 'fa-brands fa-android',
  ios: 'fa-brands fa-apple',
  link: 'fa-solid fa-link',
  group: 'fa-solid fa-users',
  gift: 'fa-solid fa-gift',
  messenger: 'fa-brands fa-facebook-messenger',
  game: 'fa-solid fa-gamepad',
};

const COLOR_MAP = {
  blue: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa' },
  red: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#f87171' },
  green: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#34d399' },
  yellow: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
  purple: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', text: '#a78bfa' },
  gray: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)', text: '#94a3b8' },
};

const ProfileWidget = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/profile`);
        setProfile(data);
      } catch (err) {
        console.error('Lỗi tải profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-widget">
        <div className="ww-loading">
          <div className="spinner" />
          <span>Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (!profile || !profile.sections || profile.sections.length === 0) {
    return (
      <div className="profile-widget">
        <div className="profile-empty">
          <span className="profile-empty-icon">📋</span>
          <p>Chưa có thông tin profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-widget">
      {profile.sections.map((section) => (
        <div key={section._id} className="profile-section-card">
          <div className="profile-section-title">{section.title}</div>
          <div className="profile-items-grid">
            {section.items.map((item) => {
              const color = COLOR_MAP[item.buttonColor] || COLOR_MAP.blue;
              const icon = ICON_MAP[item.buttonIcon] || 'fa-solid fa-link';
              return (
                <div key={item._id} className="profile-item">
                  <div className="profile-item-label">{item.label}</div>
                  <a
                    href={item.buttonUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-item-btn"
                    style={{
                      background: color.bg,
                      borderColor: color.border,
                      color: color.text,
                    }}
                  >
                    <span className="profile-btn-icon"><i className={icon}></i></span>
                    {item.buttonText}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileWidget;
