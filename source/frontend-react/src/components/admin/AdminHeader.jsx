import React from 'react';
import { useAuthStore } from '../../stores/authStore';

export function AdminHeader() {
  const logout = useAuthStore(state => state.logout);

  return (
    <header className="site-header admin-site-header">
      <div className="brand-wrap">
        <a className="brand" href="/admin.html">
          <span className="brand-icon">⚡</span>
          <span>HomeMart Portal</span>
        </a>
        <span className="portal-badge">ADMINISTRATOR</span>
      </div>
      <nav className="admin-nav-actions">
        <a href="/" className="nav-button btn-store-link">
          🏪 Xem Cửa hàng
        </a>
        <div className="admin-user-chip">
          <span className="avatar-dot"></span>
          <span className="admin-name">Quản trị viên</span>
        </div>
        <button className="nav-button btn-logout" onClick={logout} type="button">
          🚪 Đăng xuất
        </button>
      </nav>
    </header>
  );
}
