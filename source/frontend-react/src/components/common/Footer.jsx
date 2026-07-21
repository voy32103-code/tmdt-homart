import React from 'react';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <span className="brand-icon">✨</span>
            <span>HomeMart</span>
          </div>
          <p className="brand-desc">
            Sàn thương mại đồ gia dụng hàng đầu. Kết nối sản phẩm chính hãng với giải pháp vận chuyển tối ưu cho mọi ngôi nhà Việt.
          </p>
          <div className="trust-badges">
            <span className="badge-item">🛡️ 100% Chính hãng</span>
            <span className="badge-item">🚚 Giao hàng 2h</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Khám phá</h4>
          <ul>
            <li><a href="/">Trang chủ Cửa hàng</a></li>
            <li><a href="#products">Sản phẩm nổi bật</a></li>
            <li><a href="/admin.html">Trang quản trị Admin</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li><span>📞 Hotline: <strong>1900 6868</strong></span></li>
            <li><span>✉️ Email: <strong>hotro@homemart.vn</strong></span></li>
            <li><span>📍 Địa chỉ: 123 Nguyễn Văn Cừ, Q.5, TP.HCM</span></li>
            <li><span>⏰ Giờ làm việc: 08:00 - 21:00 hàng ngày</span></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Thanh toán & Giao hàng</h4>
          <p className="muted-text">Hỗ trợ đa dạng phương thức thanh toán an toàn và linh hoạt:</p>
          <div className="payment-tags">
            <span className="pay-tag">💵 COD (Tiền mặt)</span>
            <span className="pay-tag">💳 Thẻ ATM / Visa</span>
            <span className="pay-tag">📱 MoMo / VNPay</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>© 2026 HomeMart Household Marketplace. Tất cả quyền được bảo lưu.</p>
          <div className="footer-links">
            <a href="#">Điều khoản sử dụng</a>
            <span>•</span>
            <a href="#">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
