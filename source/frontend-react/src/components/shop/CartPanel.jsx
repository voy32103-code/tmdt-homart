import React from 'react';
import { useCartStore } from '../../stores/cartStore';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const FREESHIP_THRESHOLD = 500000;

export function CartPanel({ isOpen, onClose, onOpenCheckout }) {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCartStore();

  if (!isOpen) return null;

  const totalPrice = getTotalPrice();
  const freeshipProgress = Math.min(100, (totalPrice / FREESHIP_THRESHOLD) * 100);
  const remainingForFreeship = FREESHIP_THRESHOLD - totalPrice;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title-row">
            <h3>Giỏ hàng của bạn</h3>
            <span className="cart-item-count">{getTotalItems()} sản phẩm</span>
          </div>
          <button className="close-btn" onClick={onClose} type="button">×</button>
        </div>

        {cart.length > 0 && (
          <div className="freeship-banner">
            {remainingForFreeship > 0 ? (
              <p>Mua thêm <strong>{money.format(remainingForFreeship)}</strong> để được 🎁 <strong>Miễn phí giao hàng</strong></p>
            ) : (
              <p className="freeship-success">🎉 Bạn đã đủ điều kiện <strong>Miễn phí giao hàng!</strong></p>
            )}
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${freeshipProgress}%` }}></div>
            </div>
          </div>
        )}

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <span className="cart-empty-icon">🛒</span>
              <h4>Giỏ hàng đang trống</h4>
              <p>Hãy chọn sản phẩm yêu thích và thêm vào giỏ hàng ngay nhé!</p>
            </div>
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
                      <span className="qty-num">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} type="button">+</button>
                    </div>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => removeFromCart(item.productId)}
                    type="button"
                    title="Xóa khỏi giỏ"
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
              <span>Tạm tính:</span>
              <strong>{money.format(totalPrice)}</strong>
            </div>
            <button className="btn-checkout" onClick={onOpenCheckout} type="button">
              Tiến hành Đặt hàng ngay →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
