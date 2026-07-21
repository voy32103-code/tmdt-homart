import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ProductGrid } from './components/shop/ProductGrid';
import { CartPage } from './components/shop/CartPage';
import { CheckoutModal } from './components/shop/CheckoutModal';
import { CommentModal } from './components/shop/CommentModal';
import { ProductDetailModal } from './components/shop/ProductDetailModal';
import { PaymentCallback } from './components/shop/PaymentCallback';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useProducts } from './hooks/useProducts';
import { useCategories } from './hooks/useCategories';
import { useCartStore } from './stores/cartStore';
import { logisticsApi } from './api/logisticsApi';
import ChatbotWidget from './Chatbot.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('shop'); // 'shop' | 'cart' | 'payment-callback'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [logisticsCompanies, setLogisticsCompanies] = useState([]);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [commentProduct, setCommentProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const { products, loading: productsLoading, refreshProducts } = useProducts(selectedCategory, searchQuery);
  const { categories, loading: categoriesLoading } = useCategories();
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    logisticsApi.getAllCompanies()
      .then(data => setLogisticsCompanies(Array.isArray(data) ? data : []))
      .catch(err => console.error('Lỗi nạp đơn vị giao nhận:', err));

    if (window.location.pathname.includes('payment-callback') || window.location.search.includes('vnp_SecureHash')) {
      setCurrentPage('payment-callback');
    }
  }, []);

  const handleCheckoutSuccess = (order) => {
    setIsCheckoutOpen(false);
    refreshProducts();
    alert(`Đặt hàng thành công! Mã đơn hàng của bạn: ${order.orderCode}`);
    setCurrentPage('shop');
  };

  const handleAddToCartAndNotify = (product) => {
    addToCart(product);
  };

  return (
    <div className="app-layout">
      <Header
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentPage('shop');
        }}
      />

      <main className="main-content" style={{ minHeight: '80vh', padding: '24px 0' }}>
        {currentPage === 'payment-callback' ? (
          <PaymentCallback
            onReturnHome={() => {
              window.history.replaceState({}, '', '/');
              setCurrentPage('shop');
            }}
          />
        ) : currentPage === 'cart' ? (
          <CartPage
            onContinueShopping={() => setCurrentPage('shop')}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        ) : (
          <div className="container">
            {/* Hero Section */}
            <section className="hero card">
              <div className="hero-content">
                <span className="hero-pill">🌿 Mua sắm thông minh cho tổ ấm</span>
                <h1>Thiết bị gia dụng hiện đại, giao nhận tận tâm</h1>
                <p>Khám phá sản phẩm nhà bếp, đồ dùng thông minh chính hãng với chi phí tối ưu và đối tác giao vận uy tín.</p>
                <div className="hero-cta-group">
                  <button
                    type="button"
                    className="btn-hero-primary"
                    onClick={() => {
                      const el = document.querySelector('.shop-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Khám phá sản phẩm ↓
                  </button>
                  <button
                    type="button"
                    className="btn-hero-secondary"
                    onClick={() => setCurrentPage('cart')}
                  >
                    🛒 Xem giỏ hàng
                  </button>
                </div>
                <div className="hero-features-strip">
                  <div className="feature-item">
                    <span className="icon">🚀</span>
                    <span>Giao hàng nhanh 2h</span>
                  </div>
                  <div className="feature-item">
                    <span className="icon">🛡️</span>
                    <span>Bảo hành chính hãng</span>
                  </div>
                  <div className="feature-item">
                    <span className="icon">💎</span>
                    <span>Giá cạnh tranh</span>
                  </div>
                </div>
              </div>
              <div className="hero-image-wrap">
                <img
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
                  alt="HomeMart Banner"
                />
                <div className="hero-glass-card">
                  <div className="glass-stat">
                    <span className="num">100%</span>
                    <span className="lbl">Chính hãng</span>
                  </div>
                  <div className="glass-divider"></div>
                  <div className="glass-stat">
                    <span className="num">4.9★</span>
                    <span className="lbl">Đánh giá tốt</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Shop Product Grid */}
            {(productsLoading || categoriesLoading) ? (
              <LoadingSpinner text="Đang nạp danh sách sản phẩm gia dụng..." />
            ) : (
              <ProductGrid
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                products={products}
                onAddToCart={handleAddToCartAndNotify}
                onViewDetail={(p) => setDetailProduct(p)}
                onOpenComment={(p) => setCommentProduct(p)}
              />
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        logisticsCompanies={logisticsCompanies}
        onSuccess={handleCheckoutSuccess}
      />

      {detailProduct && (
        <ProductDetailModal
          isOpen={!!detailProduct}
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={handleAddToCartAndNotify}
          onOpenComment={(p) => setCommentProduct(p)}
        />
      )}


      {commentProduct && (
        <CommentModal
          isOpen={!!commentProduct}
          product={commentProduct}
          onClose={() => setCommentProduct(null)}
        />
      )}


      {/* AI Chatbot Floating Widget */}
      <ChatbotWidget />
    </div>
  );
}
