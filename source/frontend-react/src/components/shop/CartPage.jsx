import React, { useState } from 'react';
import { useCartStore } from '../../stores/cartStore';

export function CartPage({ onContinueShopping, onOpenCheckout }) {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const freeshipThreshold = 500000; // 500kđ
  const remainingForFreeship = Math.max(0, freeshipThreshold - totalPrice);
  const freeshipProgress = Math.min(100, (totalPrice / freeshipThreshold) * 100);

  const shippingFee = totalPrice >= freeshipThreshold || totalPrice === 0 ? 0 : 30000;
  const finalPrice = Math.max(0, totalPrice - appliedDiscount + shippingFee);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (!promoCode.trim()) {
      setPromoError('Vui lòng nhập mã giảm giá.');
      return;
    }

    const code = promoCode.trim().toUpperCase();
    if (code === 'HOMEMART10' || code === 'SALE10') {
      const discount = Math.round(totalPrice * 0.1);
      setAppliedDiscount(discount);
      setPromoSuccess('Áp dụng mã giảm giá 10% thành công!');
    } else if (code === 'FREESHIP' || code === 'KM30K') {
      const discount = 30000;
      setAppliedDiscount(discount);
      setPromoSuccess('Đã áp dụng giảm 30.000đ phí vận chuyển!');
    } else {
      setPromoError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  return (
    <div className="cart-page-container container">
      {/* Breadcrumb Navigation */}
      <nav className="cart-breadcrumb">
        <button type="button" onClick={onContinueShopping} className="breadcrumb-link">
          Trang chủ
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Giỏ hàng</span>
      </nav>

      <div className="cart-header">
        <h1 className="cart-page-title">
          Giỏ hàng của bạn{' '}
          {totalItems > 0 && <span className="cart-count-pill">{totalItems} sản phẩm</span>}
        </h1>
        {cart.length > 0 && (
          <button type="button" onClick={clearCart} className="btn-clear-cart">
            🗑️ Xóa tất cả
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty-state">
          <div className="empty-icon-wrapper">
            <span className="empty-cart-icon">🛒</span>
          </div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy chọn thêm sản phẩm gia dụng chất lượng cao để lấp đầy giỏ hàng nhé!</p>
          <button type="button" onClick={onContinueShopping} className="btn-primary-lg">
            ✨ Khám phá sản phẩm ngay
          </button>
        </div>
      ) : (
        <div className="cart-page-layout">
          {/* Main Items Section */}
          <div className="cart-items-section">
            {/* Free Shipping Progress Banner */}
            <div className="freeship-card">
              <div className="freeship-info">
                <span>
                  {remainingForFreeship > 0 ? (
                    <>
                      🚚 Mua thêm <strong>{remainingForFreeship.toLocaleString('vi-VN')} ₫</strong> để
                      được <strong>Miễn phí vận chuyển</strong>!
                    </>
                  ) : (
                    <>🎉 Bạn đã đạt điều kiện <strong>Miễn phí vận chuyển toàn quốc</strong>!</>
                  )}
                </span>
                <span className="freeship-percent">{Math.round(freeshipProgress)}%</span>
              </div>
              <div className="freeship-bar-bg">
                <div
                  className="freeship-bar-fill"
                  style={{ width: `${freeshipProgress}%` }}
                ></div>
              </div>
            </div>

            {/* List of Cart Items */}
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.productId} className="cart-item-card">
                  <div className="item-img-wrapper">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="img-placeholder">🏡</div>
                    )}
                  </div>

                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <div className="item-price-unit">
                      {item.price.toLocaleString('vi-VN')} ₫
                      {item.originalPrice > item.price && (
                        <span className="item-old-price">
                          {item.originalPrice.toLocaleString('vi-VN')} ₫
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="item-quantity-stepper">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="stepper-btn"
                      aria-label="Giảm số lượng"
                    >
                      -
                    </button>
                    <span className="stepper-value">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="stepper-btn"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total-price">
                    {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="btn-remove-item"
                    title="Xóa khỏi giỏ hàng"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-actions-footer">
              <button
                type="button"
                onClick={onContinueShopping}
                className="btn-outline-back"
              >
                ← Tiếp tục mua sắm
              </button>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="cart-summary-sidebar">
            <div className="summary-card">
              <h2 className="summary-title">Tóm tắt đơn hàng</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <strong>{totalPrice.toLocaleString('vi-VN')} ₫</strong>
                </div>

                {appliedDiscount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Giảm giá khuyến mãi</span>
                    <strong>-{appliedDiscount.toLocaleString('vi-VN')} ₫</strong>
                  </div>
                )}

                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="free-tag">Miễn phí</span>
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')} ₫`
                    )}
                  </span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row grand-total-row">
                  <span>Tổng tiền thanh toán</span>
                  <strong className="grand-total-price">
                    {finalPrice.toLocaleString('vi-VN')} ₫
                  </strong>
                </div>
                <p className="vat-note">(Đã bao gồm thuế VAT nếu có)</p>
              </div>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="promo-code-form">
                <label className="promo-label">Mã ưu đãi / Quà tặng</label>
                <div className="promo-input-group">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Nhập mã (VD: HOMEMART10)"
                  />
                  <button type="submit" className="btn-apply-promo">
                    Áp dụng
                  </button>
                </div>
                {promoError && <p className="promo-msg error">{promoError}</p>}
                {promoSuccess && <p className="promo-msg success">{promoSuccess}</p>}
              </form>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (typeof onOpenCheckout === 'function') {
                    onOpenCheckout();
                  }
                }}
                className="btn-checkout-primary"

                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  width: '100%',
                  userSelect: 'none'
                }}
              >
                <span style={{ pointerEvents: 'none' }}>💳 Thanh toán VNPAY ngay</span>
                <span style={{ pointerEvents: 'none' }}>➔</span>
              </button>


            </div>

            {/* Trust Badges */}
            <div className="trust-card">
              <div className="trust-item">
                <span className="trust-icon">🛡️</span>
                <div>
                  <strong>Cam kết 100% Chính hãng</strong>
                  <p>Hoàn tiền 200% nếu phát hiện hàng giả</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🔄</span>
                <div>
                  <strong>Đổi trả dễ dàng</strong>
                  <p>7 ngày đổi trả miễn phí tận nhà</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <div>
                  <strong>Thanh toán bảo mật</strong>
                  <p>Mã hóa dữ liệu 256-bit SSL chuẩn quốc tế</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
