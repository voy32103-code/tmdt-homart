import React from 'react';
import { useAuthStore } from '../../stores/authStore';

export function AdminHeader() {
  const logout = useAuthStore(state => state.logout);

  return (
    <header className="site-header">
      <a className="brand" href="/admin.html">HomeMart Admin</a>
      <nav>
        <a href="/">Cửa hàng</a>
        <button className="nav-button" onClick={logout} type="button">Đăng xuất</button>
      </nav>
    </header>
  );
}
