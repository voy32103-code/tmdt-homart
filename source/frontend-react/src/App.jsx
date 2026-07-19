import React, { useState, useEffect, useMemo } from 'react';
import ChatbotWidget from './Chatbot.jsx';

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [logisticsCompanies, setLogisticsCompanies] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("homemart_cart") || "[]");
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // Comments state
  const [activeProduct, setActiveProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentRating, setNewCommentRating] = useState(5);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // History state
  const [historyPhone, setHistoryPhone] = useState('');
  const [historyOrders, setHistoryOrders] = useState([]);
  const [searchingHistory, setSearchingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  // Checkout form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedLogistics, setSelectedLogistics] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');

  // Fetch initial data
  const loadInitialData = async () => {
    try {
      const [productsData, categoriesData, logisticsData] = await Promise.all([
        fetch("/api/products").then(r => r.json()),
        fetch("/api/categories").then(r => r.json()),
        fetch("/api/logistics-companies").then(r => r.json())
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setLogisticsCompanies(logisticsData);
      if (logisticsData.length > 0) {
        setSelectedLogistics(String(logisticsData[0].id));
      }
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem("homemart_cart", JSON.stringify(cart));
  }, [cart]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const text = `${product.name} ${product.brand} ${product.shortDescription}`.toLowerCase();
      const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || String(product.categoryId) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return product ? sum + product.finalPrice * item.quantity : sum;
    }, 0);
  }, [cart, products]);

  const activeLogistics = useMemo(() => {
    return logisticsCompanies.find(item => String(item.id) === selectedLogistics);
  }, [logisticsCompanies, selectedLogistics]);

  const shippingFee = activeLogistics ? (activeLogistics.baseFee || 0) : 0;
  const grandTotal = cartSubtotal + shippingFee;

  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    const maxQty = product ? product.stockQuantity : 0;
    if (maxQty <= 0) {
      alert("Sản phẩm hiện đã hết hàng.");
      return;
    }
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      if (existing.quantity >= maxQty) {
        alert(`Không thể thêm sản phẩm. Hiện chỉ còn lại ${maxQty} sản phẩm trong kho.`);
        return;
      }
      setCart(cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (productId, val) => {
    const product = products.find(p => p.id === productId);
    const maxQty = product ? product.stockQuantity : 999;
    let qty = Math.max(1, Number(val || 1));
    if (qty > maxQty) {
      qty = maxQty;
      alert(`Số lượng yêu cầu vượt quá tồn kho. Hiện chỉ còn lại ${maxQty} sản phẩm trong kho.`);
    }
    setCart(cart.map(item => item.productId === productId ? { ...item, quantity: qty } : item));
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Comments modal handlers
  const handleOpenComments = async (product) => {
    setActiveProduct(product);
    setShowCommentsModal(true);
    setLoadingComments(true);
    try {
      const list = await fetch(`/api/products/${product.id}/comments`).then(r => r.json());
      setComments(list);
    } catch (err) {
      console.error(err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (!newCommentAuthor.trim() || !newCommentContent.trim()) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/products/${activeProduct.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newCommentAuthor,
          rating: Number(newCommentRating),
          content: newCommentContent
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi gửi bình luận");
      
      // Reset input
      setNewCommentAuthor('');
      setNewCommentContent('');
      setNewCommentRating(5);
      
      // Reload comments & products
      const list = await fetch(`/api/products/${activeProduct.id}/comments`).then(r => r.json());
      setComments(list);
      const updatedProducts = await fetch("/api/products").then(r => r.json());
      setProducts(updatedProducts);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // History modal handlers
  const handleSearchHistory = async (e) => {
    e.preventDefault();
    if (!historyPhone.trim()) return;
    setSearchingHistory(true);
    setHistoryError('');
    try {
      const res = await fetch(`/api/orders/history?phone=${encodeURIComponent(historyPhone)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Đăng nhập để tra cứu lịch sử mua hàng.");
      setHistoryOrders(body);
    } catch (err) {
      setHistoryError(err.message);
      setHistoryOrders([]);
    } finally {
      setSearchingHistory(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Lỗi hủy đơn hàng");
      alert("Hủy đơn hàng thành công!");

      // Refresh list
      const updatedProducts = await fetch("/api/products").then(r => r.json());
      setProducts(updatedProducts);
      const refreshRes = await fetch(`/api/orders/history?phone=${encodeURIComponent(historyPhone)}`);
      const refreshBody = await refreshRes.json();
      if (!refreshRes.ok) throw new Error(refreshBody.message || "Lỗi tải lại đơn hàng");
      setHistoryOrders(refreshBody);
    } catch (err) {
      alert(err.message);
    }
  };

  // Checkout handler
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cart.length) {
      alert("Giỏ hàng của bạn đang trống.");
      return;
    }
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName,
            phone,
            email: email || null,
            address
          },
          logisticsCompanyId: Number(selectedLogistics),
          items: cart
        })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Lỗi đặt hàng");
      
      setCart([]);
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCheckoutMessage(`Đặt hàng thành công. Mã đơn hàng của bạn là: ${body.order.orderCode}.`);
      
      // Reload products to update stock
      const updatedProducts = await fetch("/api/products").then(r => r.json());
      setProducts(updatedProducts);
    } catch (err) {
      alert(err.message);
    }
  };

  const statusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    completed: "Đã giao",
    cancelled: "Đã hủy"
  };

  return (
    <div>
      <header className="site-header">
        <a className="brand" href="/">HomeMart</a>
        <nav>
          <a onClick={() => { setSelectedCategory(''); setSearchQuery(''); }} className={selectedCategory === '' ? 'active' : ''}>Cửa hàng</a>
          <a onClick={() => setShowHistoryModal(true)}>Lịch sử đơn hàng</a>
          <a href="/admin.html">Quản trị</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">Sàn thương mại đồ gia dụng</span>
            <h1>Mua sắm nhà cửa gọn hơn, giao hàng rõ ràng hơn</h1>
            <p>Kết nối nhiều cửa hàng uy tín với các đơn vị giao nhận phù hợp về chất lượng và chi phí.</p>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80" alt="Kitchen Interior Design" />
          </div>
        </section>

        <section className="toolbar">
          <input 
            id="searchInput" 
            type="search" 
            placeholder="Tìm sản phẩm, thương hiệu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            id="categoryFilter" 
            title="Lọc theo danh mục sản phẩm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </section>

        <section className="shop-layout">
          <div id="productGrid" className="product-grid" aria-live="polite">
            {filteredProducts.map(product => {
              const hasDiscount = product.finalPrice < product.price;
              return (
                <article key={product.id} className="product-card">
                  <img src={product.imageUrl || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80"} alt={product.name} />
                  <div className="product-card-content">
                    <div className="meta">{product.categoryName} &middot; {product.storeName}</div>
                    <h2>{product.name}</h2>
                    <div className="product-rating-badge">
                      {product.commentCount > 0 ? (
                        <>
                          <span>★</span> {product.avgRating} ({product.commentCount} bình luận)
                        </>
                      ) : (
                        <>
                          <span>★</span> Chưa có bình luận
                        </>
                      )}
                    </div>
                    <p className="muted">{product.shortDescription || ""}</p>
                    <div className="price-row" style={{ marginTop: 'auto' }}>
                      <span className="final-price">{money.format(product.finalPrice)}</span>
                      {hasDiscount && <span className="old-price">{money.format(product.price)}</span>}
                    </div>
                    {product.promotion && <div className="promo-badge">{product.promotion.name}</div>}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                      <button type="button" style={{ flex: 1 }} onClick={() => handleAddToCart(product.id)}>Thêm vào giỏ hàng</button>
                      <button 
                        type="button" 
                        style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--line)', padding: '0 12px', width: 'auto' }} 
                        onClick={() => handleOpenComments(product)}
                        title="Xem bình luận & đánh giá"
                      >
                        Bình luận
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            {filteredProducts.length === 0 && (
              <p className="muted">Không tìm thấy sản phẩm phù hợp.</p>
            )}
          </div>

          <aside className="cart-panel">
            <h2>Giỏ hàng</h2>
            <div id="cartItems" className="cart-items">
              {cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="cart-item">
                    <div className="cart-item-info">
                      <strong>{product.name}</strong>
                      <span className="cart-item-price">{money.format(product.finalPrice)}</span>
                    </div>
                    <div className="cart-item-controls">
                      <input 
                        type="number" 
                        min="1" 
                        max={product.stockQuantity} 
                        value={item.quantity} 
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                      />
                      <button type="button" className="danger" onClick={() => handleRemoveFromCart(item.productId)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              {cart.length === 0 && (
                <p className="muted">Giỏ hàng hiện đang trống.</p>
              )}
            </div>
            <div className="cart-totals">
              <div className="cart-total-row">
                <span>Tạm tính</span>
                <span>{money.format(cartSubtotal)}</span>
              </div>
              <div className="cart-total-row">
                <span>Phí vận chuyển</span>
                <span>{money.format(shippingFee)}</span>
              </div>
              <div className="cart-total-row grand-total">
                <span>Tổng cộng</span>
                <strong>{money.format(grandTotal)}</strong>
              </div>
            </div>
            <form id="checkoutForm" className="checkout-form" onSubmit={handleCheckout}>
              <label>Họ và tên
                <input 
                  name="fullName" 
                  required 
                  placeholder="Nhập họ và tên của bạn" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>
              <label>Số điện thoại
                <input 
                  name="phone" 
                  required 
                  placeholder="Nhập số điện thoại liên hệ" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label>Địa chỉ email
                <input 
                  name="email" 
                  type="email" 
                  placeholder="Nhập địa chỉ email (không bắt buộc)" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>Địa chỉ giao hàng
                <input 
                  name="address" 
                  required 
                  placeholder="Nhập địa chỉ giao hàng chi tiết" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
              <label>Đơn vị giao nhận
                <select 
                  name="logisticsCompanyId" 
                  required 
                  value={selectedLogistics}
                  onChange={(e) => setSelectedLogistics(e.target.value)}
                >
                  {logisticsCompanies.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {money.format(item.baseFee || 0)}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">Đặt hàng</button>
            </form>
            {checkoutMessage && <p id="checkoutMessage">{checkoutMessage}</p>}
          </aside>
        </section>
      </main>

      {/* Modal Lịch sử đơn hàng */}
      {showHistoryModal && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <button className="modal-close" onClick={() => { setShowHistoryModal(false); setHistoryOrders([]); setHistoryPhone(''); }}>&times;</button>
            <h2 className="modal-title">Lịch sử mua hàng</h2>
            <form className="history-search-form" onSubmit={handleSearchHistory}>
              <input 
                type="text" 
                required 
                placeholder="Nhập số điện thoại mua hàng..." 
                value={historyPhone}
                onChange={(e) => setHistoryPhone(e.target.value)}
              />
              <button type="submit" style={{ width: 'auto' }}>Tra cứu</button>
            </form>
            <div className="orders-history-list">
              {searchingHistory && <p className="comments-empty">Đang tìm kiếm đơn hàng...</p>}
              {!searchingHistory && historyOrders.length === 0 && !historyError && (
                <p className="comments-empty">Nhập số điện thoại để tra cứu các đơn hàng đã đặt.</p>
              )}
              {historyError && (
                <p className="comments-empty" style={{ color: 'var(--accent)' }}>{historyError}</p>
              )}
              {!searchingHistory && historyOrders.map(order => (
                <div key={order.id} className="order-history-item">
                  <div className="order-history-item-header">
                    <span className="order-history-code">{order.orderCode}</span>
                    <span className={`status-badge status-${order.status}`}>{statusLabels[order.status] || order.status}</span>
                    <div className="order-history-date">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                  </div>
                  <div className="order-history-item-body">
                    <div className="order-history-products">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-history-product-line">
                          <span>{item.productName} x {item.quantity}</span>
                          <span>{money.format(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-history-footer">
                      <span className="muted">Phí giao nhận: {money.format(order.shippingFee)}</span>
                      <span className="order-history-total">Tổng thanh toán: {money.format(order.grandTotal)}</span>
                    </div>
                    {(order.status === "pending" || order.status === "confirmed") && (
                      <div style={{ textAlign: 'right', marginTop: '8px' }}>
                        <button className="cancel-btn" onClick={() => handleCancelOrder(order.id)}>Hủy đơn</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Bình luận sản phẩm */}
      {showCommentsModal && activeProduct && (
        <div className="modal-overlay active">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setShowCommentsModal(false)}>&times;</button>
            <h2 className="modal-title">Đánh giá & Bình luận: {activeProduct.name}</h2>
            {localStorage.getItem("homemart_admin_token") ? (
              <p className="comments-empty" style={{ color: 'var(--accent)', fontWeight: 'bold', margin: '40px 0', textAlign: 'center' }}>
                Quản trị viên không được phép xem bình luận của người dùng.
              </p>
            ) : (
              <>
                <div className="comments-list">
                  {loadingComments && <p className="comments-empty">Đang tải bình luận...</p>}
                  {!loadingComments && comments.length === 0 && (
                    <p className="comments-empty">Chưa có bình luận nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
                  )}
                  {!loadingComments && comments.map(item => (
                    <div key={item.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{item.customerName}</span>
                        <span className="comment-date">
                          {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                      <div className="comment-rating">{"★".repeat(item.rating) + "☆".repeat(5 - item.rating)}</div>
                      <div className="comment-text">{item.content}</div>
                    </div>
                  ))}
                </div>
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <h3 className="comment-form-title">Viết bình luận mới</h3>
                  <div className="comment-form-grid">
                    <label className="comment-form-label">
                      Họ và tên
                      <input 
                        type="text" 
                        required 
                        placeholder="Họ và tên của bạn..." 
                        value={newCommentAuthor}
                        onChange={(e) => setNewCommentAuthor(e.target.value)}
                      />
                    </label>
                    <label className="comment-form-label">
                      Đánh giá sao
                      <select 
                        value={newCommentRating} 
                        onChange={(e) => setNewCommentRating(Number(e.target.value))}
                        required
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 - Rất tốt)</option>
                        <option value="4">⭐⭐⭐⭐ (4 - Tốt)</option>
                        <option value="3">⭐⭐⭐ (3 - Bình thường)</option>
                        <option value="2">⭐⭐ (2 - Chưa tốt)</option>
                        <option value="1">⭐ (1 - Rất tệ)</option>
                      </select>
                    </label>
                  </div>
                  <label className="comment-form-label">
                    Nội dung bình luận
                    <textarea 
                      required 
                      placeholder="Nhập cảm nhận của bạn về sản phẩm..." 
                      rows="3"
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                    />
                  </label>
                  <button type="submit" className="comment-form-submit" disabled={submittingComment} style={{ width: 'auto' }}>
                    {submittingComment ? "Đang gửi..." : "Gửi bình luận"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
