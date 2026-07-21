import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ProductGrid } from './components/shop/ProductGrid';
import { CartPanel } from './components/shop/CartPanel';
import { CheckoutModal } from './components/shop/CheckoutModal';
import { OrderLookupModal } from './components/shop/OrderLookupModal';
import { CommentModal } from './components/shop/CommentModal';
import { ProductDetailModal } from './components/shop/ProductDetailModal';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useProducts } from './hooks/useProducts';
import { useCategories } from './hooks/useCategories';
import { useCartStore } from './stores/cartStore';
import { logisticsApi } from './api/logisticsApi';
import ChatbotWidget from './Chatbot.jsx';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [logisticsCompanies, setLogisticsCompanies] = useState([]);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [commentProduct, setCommentProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const { products, loading: productsLoading, refreshProducts } = useProducts(selectedCategory, searchQuery);
  const { categories, loading: categoriesLoading } = useCategories();
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    logisticsApi.getAllCompanies()
      .then(data => setLogisticsCompanies(data))
      .catch(err => console.error('Lỗi nạp đơn vị giao nhận:', err));
  }, []);

  const handleCheckoutSuccess = (order) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    refreshProducts();
    alert(`Đặt hàng thành công! Mã đơn hàng của bạn: ${order.orderCode}`);
  };

  return (
    <div className="app-layout">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="container main-content" style={{ minHeight: '80vh', padding: '24px 16px' }}>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">Sàn thương mại đồ gia dụng</span>
            <h1>Mua sắm nhà cửa gọn hơn, giao hàng rõ ràng hơn</h1>
            <p>Kết nối nhiều cửa hàng uy tín với các đơn vị giao nhận phù hợp về chất lượng và chi phí.</p>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
              alt="HomeMart Banner"
              style={{ borderRadius: '12px', width: '100%', maxHeight: '320px', objectFit: 'cover' }}
            />
          </div>
        </section>

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
            onAddToCart={addToCart}
            onViewDetail={(p) => setDetailProduct(p)}
            onOpenComment={(p) => setCommentProduct(p)}
          />
        )}
      </main>

      <Footer />

      {/* Side-Drawer Cart */}
      <CartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        logisticsCompanies={logisticsCompanies}
        onSuccess={handleCheckoutSuccess}
      />

      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
      />

      <CommentModal
        isOpen={!!commentProduct}
        onClose={() => setCommentProduct(null)}
        product={commentProduct}
      />

      <ProductDetailModal
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        product={detailProduct}
        onAddToCart={addToCart}
      />

      <ChatbotWidget />
    </div>
  );
}
