import React from 'react';
import { useCartStore } from '../../stores/cartStore';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function CartPanel({ isOpen, onClose, onOpenCheckout }) {
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3>Giỏ hàng của bạn</h3>
          <button className="close-btn" onClick={onClose} type="button">×</button>
        </div>
        <div className="cart-body">
          {cart.length === 0 ? (
            <p className="empty-cart-msg">Giỏ hàng của bạn đang trống.</p>
          ) : (
            <ul className="cart-item-list">
              {cart.map(item => (
                <li key={item.productId} className="cart-item">
                  <img src={item.imageUrl} alt={item.name} />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <span className="price">{money.format(item.price)}</span>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.productId, -1)} type="button">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} type="button">+</button>
                    </div>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => removeFromCart(item.productId)}
                    type="button"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Tổng thanh toán:</span>
              <strong>{money.format(getTotalPrice())}</strong>
            </div>
            <button className="btn-checkout" onClick={onOpenCheckout} type="button">
              Tiến hành Đặt hàng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
