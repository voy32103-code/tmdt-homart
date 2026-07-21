import React from 'react';
import { useCartStore } from '../../stores/cartStore';

export function Header({ onOpenCart, onOpenOrderLookup, activeCategory, onSelectCategory }) {
  const totalItems = useCartStore(state => state.getTotalItems());

  return (
    <header className="site-header">
      <div className="brand" onClick={() => onSelectCategory('all')} style={{ cursor: 'pointer' }}>
        HomeMart
      </div>
      <nav>
        <button
          className={`nav-button ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
          type="button"
        >
          Trang chủ
        </button>
        <button
          className="nav-button"
          onClick={onOpenOrderLookup}
          type="button"
        >
          Tra cứu đơn hàng
        </button>
        <button
          className="nav-button cart-badge-btn"
          onClick={onOpenCart}
          type="button"
        >
          Giỏ hàng <span className="badge">{totalItems}</span>
        </button>
        <a href="/admin.html" className="nav-button admin-link">
          Quản trị
        </a>
      </nav>
    </header>
  );
}
