import React from 'react';
import { useCartStore } from '../../stores/cartStore';

export function Header({ currentPage, onNavigate, activeCategory, onSelectCategory }) {
  const totalItems = useCartStore(state => state.getTotalItems());

  const handleGoHome = () => {
    onSelectCategory('all');
    onNavigate('shop');
  };

  return (
    <header className="site-header">
      <div className="brand" onClick={handleGoHome} style={{ cursor: 'pointer' }}>
        <span className="brand-icon">✨</span>
        <span>HomeMart</span>
      </div>
      <nav>
        <button
          className={`nav-button ${currentPage === 'shop' && activeCategory === 'all' ? 'active' : ''}`}
          onClick={handleGoHome}
          type="button"
        >
          Trang chủ
        </button>
        <button
          className={`nav-button cart-badge-btn ${currentPage === 'cart' ? 'active' : ''}`}
          onClick={() => onNavigate('cart')}
          type="button"
        >
          🛒 Giỏ hàng {totalItems > 0 && <span className="badge">{totalItems}</span>}
        </button>
        <a href="/admin.html" className="nav-button admin-link">
          ⚙️ Quản trị
        </a>
      </nav>
    </header>
  );
}
