import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  PhoneCall,
  Mail,
  MapPin,
  ArrowUpRight,
  Send,
  Lock,
  Heart
} from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer-modern">
      {/* Top Ambient Glow Effect */}
      <div className="footer-glow-orb" />

      <div className="container">
        {/* Double-Bezel Newsletter & CTA Shell */}
        <div className="newsletter-bezel-outer">
          <div className="newsletter-bezel-inner">
            <div className="newsletter-content">
              <div className="newsletter-text">
                <span className="eyebrow-badge">
                  <Sparkles size={12} className="text-emerald-400" />
                  <span>Ưu Đãi Đặc Quyền</span>
                </span>
                <h3 className="newsletter-title">Đăng ký nhận mã giảm giá 15% cho đơn đầu tiên</h3>
                <p className="newsletter-desc">Nhận thông báo ưu đãi độc quyền và xu hướng đồ gia dụng thông minh mới nhất.</p>
              </div>

              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <div className="input-nested-wrapper">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn..."
                    className="newsletter-input"
                    required
                  />
                  <button type="submit" className="nested-pill-btn group">
                    <span>Đăng ký</span>
                    <span className="btn-icon-circle">
                      <Send size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Main 4-Column High-End Grid */}
        <div className="footer-main-grid">
          {/* Column 1: Brand Info & Trust Badges */}
          <div className="footer-col-brand">
            <div className="footer-brand-logo">
              <span className="brand-icon-wrapper">
                <Sparkles size={20} className="brand-sparkle" />
              </span>
              <span className="brand-text-gradient">HomeMart</span>
            </div>
            <p className="brand-manifesto">
              Sàn thương mại gia dụng cao cấp hàng đầu Việt Nam. Mang lại giải pháp không gian sống tiện nghi, thông minh và hiện đại cho mọi gia đình.
            </p>

            <div className="trust-badges-grid">
              <div className="trust-badge-pill">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>100% Chính Hãng</span>
              </div>
              <div className="trust-badge-pill">
                <Truck size={14} className="text-teal-400" />
                <span>Giao Hàng 2h</span>
              </div>
              <div className="trust-badge-pill">
                <Lock size={14} className="text-indigo-400" />
                <span>Bảo Mật 256-bit</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="col-heading">Khám Phá Cửa Hàng</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="/" className="footer-link group">
                  <span>Trang chủ Shop</span>
                  <ArrowUpRight size={14} className="link-arrow" />
                </a>
              </li>
              <li>
                <a href="#products" className="footer-link group">
                  <span>Sản phẩm nổi bật</span>
                  <ArrowUpRight size={14} className="link-arrow" />
                </a>
              </li>
              <li>
                <a href="#categories" className="footer-link group">
                  <span>Danh mục thiết bị gia dụng</span>
                  <ArrowUpRight size={14} className="link-arrow" />
                </a>
              </li>
              <li>
                <a href="/admin.html" className="footer-link group">
                  <span>Cổng quản trị Admin</span>
                  <ArrowUpRight size={14} className="link-arrow" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="footer-col">
            <h4 className="col-heading">Hỗ Trợ Khách Hàng</h4>
            <div className="contact-card-mini">
              <div className="contact-item">
                <div className="contact-icon">
                  <PhoneCall size={15} />
                </div>
                <div>
                  <span className="contact-label">Hotline Tư vấn 24/7</span>
                  <a href="tel:19006868" className="contact-value highlight">1900 6868</a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={15} />
                </div>
                <div>
                  <span className="contact-label">Email hỗ trợ</span>
                  <span className="contact-value">hotro@homemart.vn</span>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={15} />
                </div>
                <div>
                  <span className="contact-label">Địa chỉ trụ sở</span>
                  <span className="contact-value">123 Nguyễn Văn Cừ, Q.5, TP.HCM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Payment & Logistics Partnerships */}
          <div className="footer-col">
            <h4 className="col-heading">Thanh Toán & Vận Chuyển</h4>
            <p className="col-subtext">Hệ thống chấp nhận các cổng thanh toán bảo mật & các đơn vị giao hàng hàng đầu:</p>

            <div className="partner-badges-wrap">
              <span className="partner-chip">💵 COD (Tiền mặt)</span>
              <span className="partner-chip highlight-vnpay">💳 Cổng VNPAY</span>
              <span className="partner-chip">🏦 Thẻ ATM Nội Địa</span>
              <span className="partner-chip">🚚 Giao Hàng Tiết Kiệm</span>
              <span className="partner-chip">📦 Giao Hàng Nhanh</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="bottom-flex">
            <p className="copyright-text">
              © 2026 <strong>HomeMart Household Marketplace</strong>. Được thiết kế với <Heart size={13} className="text-rose-500 inline mx-0.5 fill-rose-500" /> theo chuẩn Clean Architecture.
            </p>

            <div className="bottom-actions">
              <div className="bottom-links">
                <a href="#">Điều khoản dịch vụ</a>
                <span className="dot-divider">•</span>
                <a href="#">Chính sách bảo mật</a>
                <span className="dot-divider">•</span>
                <a href="#">Quy chế hoạt động</a>
              </div>

              <button onClick={scrollToTop} className="scroll-top-btn" title="Về đầu trang">
                <span>Đầu trang</span>
                <ArrowUpRight size={14} className="-rotate-45" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
