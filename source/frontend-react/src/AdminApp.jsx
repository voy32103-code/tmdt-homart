import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem("homemart_admin_token") || "");
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginMessage, setLoginMessage] = useState('');

  // Active section tab
  const [activeTab, setActiveTab] = useState('reports'); // reports, categories, products, prices, orders, logistics, partners, comments

  // Data collections
  const [summaryCounts, setSummaryCounts] = useState({ products: 0, categories: 0, activePromotions: 0, logisticsCompanies: 0 });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [logisticsCompanies, setLogisticsCompanies] = useState([]);
  const [partners, setPartners] = useState([]);
  const [comments, setComments] = useState([]);

  // Reports
  const [reportFromDate, setReportFromDate] = useState('');
  const [reportToDate, setReportToDate] = useState('');
  const [overviewKpis, setOverviewKpis] = useState({ totalRevenue: 0, totalOrders: 0, completedOrders: 0, cancelledOrders: 0 });
  const [revenueByDate, setRevenueByDate] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [orderStatusSummary, setOrderStatusSummary] = useState([]);

  // Form states - Categories
  const [catId, setCatId] = useState('');
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catSort, setCatSort] = useState(0);
  const [catSeoTitle, setCatSeoTitle] = useState('');
  const [catSeoDesc, setCatSeoDesc] = useState('');

  // Form states - Products
  const [prodId, setProdId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodSeoTitle, setProdSeoTitle] = useState('');
  const [prodSeoDesc, setProdSeoDesc] = useState('');

  // Form states - Price History
  const [priceProductId, setPriceProductId] = useState('');
  const [priceNewVal, setPriceNewVal] = useState('');
  const [priceStartsAt, setPriceStartsAt] = useState('');
  const [priceNote, setPriceNote] = useState('');

  // Form states - Promotions
  const [promoId, setPromoId] = useState('');
  const [promoProductId, setPromoProductId] = useState('');
  const [promoName, setPromoName] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState('percent');
  const [promoDiscountValue, setPromoDiscountValue] = useState('');
  const [promoStartsAt, setPromoStartsAt] = useState('');
  const [promoEndsAt, setPromoEndsAt] = useState('');
  const [promoStatus, setPromoStatus] = useState('active');

  // Form states - Logistics
  const [logId, setLogId] = useState('');
  const [logName, setLogName] = useState('');
  const [logSlug, setLogSlug] = useState('');
  const [logPhone, setLogPhone] = useState('');
  const [logBaseFee, setLogBaseFee] = useState(0);
  const [logRating, setLogRating] = useState(5);
  const [logStatus, setLogStatus] = useState('active');

  // Form states - Partners
  const [partnerId, setPartnerId] = useState('');
  const [partnerStoreId, setPartnerStoreId] = useState(1);
  const [partnerLogisticsId, setPartnerLogisticsId] = useState('');
  const [partnerBaseFee, setPartnerBaseFee] = useState(0);
  const [partnerFeePerKm, setPartnerFeePerKm] = useState(0);
  const [partnerRating, setPartnerRating] = useState(5);
  const [partnerStatus, setPartnerStatus] = useState('active');
  const [partnerServiceArea, setPartnerServiceArea] = useState('');

  // Helper API fetch
  const apiCall = async (path, options = {}, needsAuth = true) => {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (needsAuth && token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(path, { ...options, headers });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    return body;
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage('');
    try {
      const result = await apiCall("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      }, false);
      localStorage.setItem("homemart_admin_token", result.token);
      setToken(result.token);
    } catch (err) {
      setLoginMessage(err.message);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await apiCall("/api/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("homemart_admin_token");
    setToken('');
  };

  // Refresh reports
  const fetchReports = async () => {
    let queryParams = "";
    if (reportFromDate || reportToDate) {
      const params = new URLSearchParams();
      if (reportFromDate) params.append("from", reportFromDate);
      if (reportToDate) params.append("to", reportToDate);
      queryParams = "?" + params.toString();
    }

    try {
      const [overview, dailyRevenue, topProds, catRevenue, statusSumm] = await Promise.all([
        apiCall(`/api/admin/reports/overview${queryParams}`),
        apiCall(`/api/admin/reports/revenue-by-date${queryParams}`),
        apiCall(`/api/admin/reports/top-products${queryParams}`),
        apiCall(`/api/admin/reports/revenue-by-category${queryParams}`),
        apiCall(`/api/admin/reports/order-status-summary${queryParams}`)
      ]);

      setOverviewKpis(overview);
      setRevenueByDate(dailyRevenue);
      setTopProducts(topProds);
      setRevenueByCategory(catRevenue);
      setOrderStatusSummary(statusSumm);
    } catch (err) {
      console.error(err);
    }
  };

  // Main reload logic
  const refreshAllData = async () => {
    if (!token) return;
    try {
      const [
        summary,
        categoryData,
        productData,
        promotionData,
        orderData,
        logisticsData,
        partnerData,
        commentsData
      ] = await Promise.all([
        apiCall("/api/summary"),
        apiCall("/api/categories"),
        apiCall("/api/products"),
        apiCall("/api/promotions"),
        apiCall("/api/admin/orders"),
        apiCall("/api/admin/logistics-companies"),
        apiCall("/api/admin/store-logistics-partners"),
        apiCall("/api/admin/comments")
      ]);

      setSummaryCounts(summary);
      setCategories(categoryData);
      setProducts(productData);
      setPromotions(promotionData);
      setOrders(orderData);
      setLogisticsCompanies(logisticsData);
      setPartners(partnerData);
      setComments(commentsData);

      // Pre-fill dropdowns defaults
      if (categoryData.length > 0) setProdCategoryId(String(categoryData[0].id));
      if (productData.length > 0) {
        setPriceProductId(String(productData[0].id));
        setPromoProductId(String(productData[0].id));
      }
      if (logisticsData.length > 0) setPartnerLogisticsId(String(logisticsData[0].id));

      await fetchReports();
    } catch (err) {
      console.error("Refresh error:", err);
      // Auto logout if token expired
      if (err.message.includes("Token") || err.message.includes("ủy quyền") || err.message.includes("expired")) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [token]);

  // CATEGORY FORM ACTION
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sortOrder: Number(catSort),
        seoTitle: catSeoTitle,
        seoDescription: catSeoDesc
      };
      await apiCall(catId ? `/api/categories/${catId}` : "/api/categories", {
        method: catId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      // Reset Form
      setCatId('');
      setCatName('');
      setCatSlug('');
      setCatSort(0);
      setCatSeoTitle('');
      setCatSeoDesc('');
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditCategory = (item) => {
    setCatId(item.id);
    setCatName(item.name);
    setCatSlug(item.slug);
    setCatSort(item.sortOrder);
    setCatSeoTitle(item.seoTitle || '');
    setCatSeoDesc(item.seoDescription || '');
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) return;
    try {
      await apiCall(`/api/categories/${id}`, { method: "DELETE" });
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // PRODUCT FORM ACTION
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: prodName,
        sku: prodSku,
        categoryId: Number(prodCategoryId),
        price: Number(prodPrice),
        brand: prodBrand,
        stockQuantity: Number(prodStock),
        imageUrl: prodImageUrl,
        shortDescription: prodShortDesc,
        seoTitle: prodSeoTitle,
        seoDescription: prodSeoDesc
      };
      await apiCall(prodId ? `/api/products/${prodId}` : "/api/products", {
        method: prodId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      // Reset Form
      setProdId('');
      setProdName('');
      setProdSku('');
      setProdPrice('');
      setProdBrand('');
      setProdStock('');
      setProdImageUrl('');
      setProdShortDesc('');
      setProdSeoTitle('');
      setProdSeoDesc('');
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditProduct = (item) => {
    setProdId(item.id);
    setProdName(item.name);
    setProdSku(item.sku);
    setProdCategoryId(String(item.categoryId));
    setProdPrice(item.price);
    setProdBrand(item.brand || '');
    setProdStock(item.stockQuantity);
    setProdImageUrl(item.imageUrl || '');
    setProdShortDesc(item.shortDescription || '');
    setProdSeoTitle(item.seoTitle || '');
    setProdSeoDesc(item.seoDescription || '');
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      await apiCall(`/api/products/${id}`, { method: "DELETE" });
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // PRICE HISTORY SUBMIT
  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiCall("/api/prices", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(priceProductId),
          price: Number(priceNewVal),
          startsAt: priceStartsAt,
          note: priceNote
        })
      });
      setPriceNewVal('');
      setPriceStartsAt('');
      setPriceNote('');
      alert("Cập nhật giá thành công!");
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // PROMOTIONS SUBMIT
  const handlePromotionSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productId: Number(promoProductId),
        name: promoName,
        discountType: promoDiscountType,
        discountValue: Number(promoDiscountValue),
        startsAt: promoStartsAt,
        endsAt: promoEndsAt,
        status: promoStatus
      };
      await apiCall(promoId ? `/api/promotions/${promoId}` : "/api/promotions", {
        method: promoId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setPromoId('');
      setPromoName('');
      setPromoDiscountValue('');
      setPromoStartsAt('');
      setPromoEndsAt('');
      setPromoStatus('active');
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditPromotion = (item) => {
    setPromoId(item.id);
    setPromoProductId(String(item.productId));
    setPromoName(item.name);
    setPromoDiscountType(item.discountType);
    setPromoDiscountValue(item.discountValue);
    setPromoStartsAt(item.startsAt);
    setPromoEndsAt(item.endsAt);
    setPromoStatus(item.status);
  };

  const handleDeletePromotion = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khuyến mại này?")) return;
    try {
      await apiCall(`/api/promotions/${id}`, { method: "DELETE" });
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // ORDER UPDATE STATUS
  const handleSaveOrderStatus = async (orderId, status) => {
    try {
      await apiCall(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      alert("Đã lưu thành công!");
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // LOGISTICS SUBMIT
  const handleLogisticsSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: logName,
        slug: logSlug || logName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        phone: logPhone,
        baseFee: Number(logBaseFee),
        rating: Number(logRating),
        status: logStatus
      };
      await apiCall(logId ? `/api/admin/logistics-companies/${logId}` : "/api/admin/logistics-companies", {
        method: logId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setLogId('');
      setLogName('');
      setLogSlug('');
      setLogPhone('');
      setLogBaseFee(0);
      setLogRating(5);
      setLogStatus('active');
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditLogistics = (item) => {
    setLogId(item.id);
    setLogName(item.name);
    setLogSlug(item.slug);
    setLogPhone(item.phone || '');
    setLogBaseFee(item.baseFee || 0);
    setLogRating(item.rating || 5);
    setLogStatus(item.status);
  };

  const handleDeleteLogistics = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn vị giao nhận này?")) return;
    try {
      await apiCall(`/api/admin/logistics-companies/${id}`, { method: "DELETE" });
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // PARTNERS SUBMIT
  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        storeId: Number(partnerStoreId),
        logisticsCompanyId: Number(partnerLogisticsId),
        baseFee: Number(partnerBaseFee),
        feePerKm: Number(partnerFeePerKm),
        rating: Number(partnerRating),
        status: partnerStatus,
        serviceArea: partnerServiceArea
      };
      await apiCall(partnerId ? `/api/admin/store-logistics-partners/${partnerId}` : "/api/admin/store-logistics-partners", {
        method: partnerId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setPartnerId('');
      setPartnerStoreId(1);
      setPartnerBaseFee(0);
      setPartnerFeePerKm(0);
      setPartnerRating(5);
      setPartnerStatus('active');
      setPartnerServiceArea('');
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditPartner = (item) => {
    setPartnerId(item.id);
    setPartnerStoreId(item.storeId);
    setPartnerLogisticsId(String(item.logisticsCompanyId));
    setPartnerBaseFee(item.baseFee || 0);
    setPartnerFeePerKm(item.feePerKm || 0);
    setPartnerRating(item.rating || 5);
    setPartnerStatus(item.status);
    setPartnerServiceArea(item.serviceArea || '');
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa liên kết đối tác này?")) return;
    try {
      await apiCall(`/api/admin/store-logistics-partners/${id}`, { method: "DELETE" });
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;
    try {
      await apiCall(`/api/admin/comments/${commentId}`, { method: "DELETE" });
      alert("Đã xóa bình luận thành công!");
      await refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Chart configuration memoized
  const lineChartData = useMemo(() => {
    return {
      labels: revenueByDate.map(item => item.date),
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: revenueByDate.map(item => item.totalRevenue),
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }
      ]
    };
  }, [revenueByDate]);

  const barChartData = useMemo(() => {
    return {
      labels: topProducts.map(item => item.name.length > 15 ? item.name.slice(0, 15) + "..." : item.name),
      datasets: [
        {
          label: "Số lượng bán",
          data: topProducts.map(item => item.totalQuantity),
          backgroundColor: "#f59e0b",
          borderColor: "#d97706",
          borderWidth: 1
        }
      ]
    };
  }, [topProducts]);

  const doughnutChartData = useMemo(() => {
    return {
      labels: revenueByCategory.map(item => item.categoryName),
      datasets: [
        {
          data: revenueByCategory.map(item => item.totalRevenue),
          backgroundColor: [
            "#06b6d4",
            "#10b981",
            "#6366f1",
            "#f43f5e",
            "#eab308",
            "#a855f7"
          ]
        }
      ]
    };
  }, [revenueByCategory]);

  const pieChartData = useMemo(() => {
    const statusLabelsMapping = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang giao hàng",
      completed: "Đã hoàn thành",
      cancelled: "Đã hủy"
    };
    const statusColorsMapping = {
      pending: "#eab308",
      confirmed: "#06b6d4",
      processing: "#3b82f6",
      shipping: "#a855f7",
      completed: "#22c55e",
      cancelled: "#ef4444"
    };

    return {
      labels: orderStatusSummary.map(item => statusLabelsMapping[item.status] || item.status),
      datasets: [
        {
          data: orderStatusSummary.map(item => item.count),
          backgroundColor: orderStatusSummary.map(item => statusColorsMapping[item.status] || "#94a3b8")
        }
      ]
    };
  }, [orderStatusSummary]);

  // Order status configuration
  const orderStatuses = ["pending", "confirmed", "processing", "shipping", "completed", "cancelled"];
  const orderStatusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy"
  };

  if (!token) {
    return (
      <div>
        <header className="site-header">
          <a className="brand" href="/">HomeMart Admin</a>
          <nav>
            <a href="/">Cửa hàng</a>
          </nav>
        </header>
        <main className="login-panel">
          <form className="stack-form login-form" onSubmit={handleLogin}>
            <h1>Đăng nhập hệ thống quản trị</h1>
            <label>Tài khoản
              <input 
                name="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="Nhập tài khoản quản trị" 
              />
            </label>
            <label>Mật khẩu
              <input 
                name="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Nhập mật khẩu" 
              />
            </label>
            <button type="submit">Đăng nhập</button>
            {loginMessage && <p id="loginMessage" style={{ color: 'var(--accent)', fontWeight: 600, textAlign: 'center' }}>{loginMessage}</p>}
          </form>
        </main>
      </div>
    );
  }

  return (
    <div>
      <header className="site-header">
        <a className="brand" href="/">HomeMart Admin</a>
        <nav>
          <a href="/">Cửa hàng</a>
          <button className="nav-button" onClick={handleLogout} type="button">Đăng xuất</button>
        </nav>
      </header>

      <main className="admin-layout">
        <section className="admin-top">
          <h1>Quản lý bán hàng</h1>
          <div className="summary">
            <div><strong>{summaryCounts.products}</strong>Sản phẩm</div>
            <div><strong>{summaryCounts.categories}</strong>Danh mục</div>
            <div><strong>{summaryCounts.activePromotions}</strong>Khuyến mại</div>
            <div><strong>{summaryCounts.logisticsCompanies}</strong>Giao nhận</div>
          </div>
        </section>

        {/* Section Navigation Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Báo cáo doanh thu</button>
          <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Danh mục</button>
          <button className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Sản phẩm</button>
          <button className={`admin-tab ${activeTab === 'prices' ? 'active' : ''}`} onClick={() => setActiveTab('prices')}>Giá & Khuyến mại</button>
          <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Đơn hàng</button>
          <button className={`admin-tab ${activeTab === 'logistics' ? 'active' : ''}`} onClick={() => setActiveTab('logistics')}>Giao nhận</button>
          <button className={`admin-tab ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>Đối tác liên kết</button>
          <button className={`admin-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>Bình luận</button>
        </div>

        {/* REPORTS & CHARTS SECTION */}
        {activeTab === 'reports' && (
          <section className="admin-section">
            <div className="section-title">
              <h2>Thống kê & Báo cáo doanh thu</h2>
            </div>
            <div className="report-filters card">
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto', alignItems: 'flex-end', gap: '16px', marginBottom: 0 }}>
                <label>Từ ngày
                  <input type="date" value={reportFromDate} onChange={(e) => setReportFromDate(e.target.value)} />
                </label>
                <label>Đến ngày
                  <input type="date" value={reportToDate} onChange={(e) => setReportToDate(e.target.value)} />
                </label>
                <button type="button" onClick={fetchReports} style={{ marginBottom: 0, width: 'auto' }}>Lọc dữ liệu</button>
              </div>
            </div>

            <div className="kpi-grid" style={{ marginTop: '20px' }}>
              <div className="kpi-card">
                <div className="kpi-label">Tổng doanh thu</div>
                <div className="kpi-value">{money.format(overviewKpis.totalRevenue || 0)}</div>
              </div>
              <div 
                className="kpi-card" 
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('all');
                }} 
                style={{ cursor: 'pointer' }}
              >
                <div className="kpi-label">Tổng số đơn hàng</div>
                <div className="kpi-value">{overviewKpis.totalOrders || 0}</div>
              </div>
              <div 
                className="kpi-card" 
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('completed');
                }} 
                style={{ cursor: 'pointer' }}
              >
                <div className="kpi-label">Đơn hoàn thành</div>
                <div className="kpi-value kpi-success">{overviewKpis.completedOrders || 0}</div>
              </div>
              <div 
                className="kpi-card" 
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('cancelled');
                }} 
                style={{ cursor: 'pointer' }}
              >
                <div className="kpi-label">Đơn bị hủy</div>
                <div className="kpi-value kpi-danger">{overviewKpis.cancelledOrders || 0}</div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-container card">
                <h3>Doanh thu theo ngày (VNĐ)</h3>
                <div className="chart-canvas-wrap">
                  <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { callback: (v) => v.toLocaleString("vi-VN") + " đ" } } } }} />
                </div>
              </div>
              <div className="chart-container card">
                <h3>Top 10 sản phẩm bán chạy</h3>
                <div className="chart-canvas-wrap">
                  <Bar data={barChartData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true } } }} />
                </div>
              </div>
              <div className="chart-container card">
                <h3>Doanh thu theo danh mục</h3>
                <div className="chart-canvas-wrap">
                  <Doughnut data={doughnutChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>
              <div className="chart-container card">
                <h3>Trạng thái đơn hàng</h3>
                <div className="chart-canvas-wrap">
                  <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CATEGORIES SECTION */}
        {activeTab === 'categories' && (
          <section className="admin-section">
            <div className="section-title">
              <h2>Danh mục sản phẩm</h2>
            </div>
            <form className="form-grid" onSubmit={handleCategorySubmit}>
              <label>Tên danh mục
                <input required placeholder="Ví dụ: Đồ dùng nhà bếp" value={catName} onChange={(e) => setCatName(e.target.value)} />
              </label>
              <label>Đường dẫn SEO (Slug)
                <input placeholder="Ví dụ: do-dung-nha-bep" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
              </label>
              <label>Thứ tự hiển thị
                <input type="number" value={catSort} onChange={(e) => setCatSort(Number(e.target.value))} />
              </label>
              <label>Tiêu đề SEO (Title)
                <input placeholder="Tiêu đề hiển thị trên trình duyệt" value={catSeoTitle} onChange={(e) => setCatSeoTitle(e.target.value)} />
              </label>
              <label className="wide">Mô tả SEO (Description)
                <input placeholder="Mô tả tóm tắt cho công cụ tìm kiếm" value={catSeoDesc} onChange={(e) => setCatSeoDesc(e.target.value)} />
              </label>
              <button type="submit">{catId ? "Cập nhật danh mục" : "Lưu danh mục"}</button>
            </form>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tên danh mục</th>
                    <th>Đường dẫn (Slug)</th>
                    <th>Tiêu đề SEO</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.slug}</td>
                      <td>{item.seoTitle || ""}</td>
                      <td className="row-actions">
                        <button type="button" onClick={() => handleEditCategory(item)}>Sửa</button>
                        <button type="button" className="danger" onClick={() => handleDeleteCategory(item.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PRODUCTS SECTION */}
        {activeTab === 'products' && (
          <section className="admin-section">
            <div className="section-title">
              <h2>Sản phẩm</h2>
            </div>
            <form className="form-grid" onSubmit={handleProductSubmit}>
              <label>Tên sản phẩm
                <input required placeholder="Nhập tên sản phẩm" value={prodName} onChange={(e) => setProdName(e.target.value)} />
              </label>
              <label>Mã sản phẩm (SKU)
                <input required placeholder="Nhập mã SKU định danh" value={prodSku} onChange={(e) => setProdSku(e.target.value)} />
              </label>
              <label>Danh mục sản phẩm
                <select required value={prodCategoryId} onChange={(e) => setProdCategoryId(e.target.value)}>
                  {categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>Giá bán (VNĐ)
                <input type="number" min="0" required placeholder="Nhập giá bán" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} />
              </label>
              <label>Thương hiệu
                <input placeholder="Nhập tên thương hiệu" value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} />
              </label>
              <label>Số lượng tồn kho
                <input type="number" min="0" required placeholder="Nhập số lượng tồn" value={prodStock} onChange={(e) => setProdStock(e.target.value)} />
              </label>
              <label className="wide">Hình ảnh sản phẩm (URL)
                <input type="url" placeholder="Nhập địa chỉ URL hình ảnh" value={prodImageUrl} onChange={(e) => setProdImageUrl(e.target.value)} />
              </label>
              <label className="wide">Mô tả ngắn sản phẩm
                <input placeholder="Nhập mô tả tóm tắt sản phẩm" value={prodShortDesc} onChange={(e) => setProdShortDesc(e.target.value)} />
              </label>
              <label>Tiêu đề SEO (Title)
                <input placeholder="Tiêu đề hiển thị công cụ tìm kiếm" value={prodSeoTitle} onChange={(e) => setProdSeoTitle(e.target.value)} />
              </label>
              <label>Mô tả SEO (Description)
                <input placeholder="Mô tả công cụ tìm kiếm" value={prodSeoDesc} onChange={(e) => setProdSeoDesc(e.target.value)} />
              </label>
              <button type="submit">{prodId ? "Cập nhật sản phẩm" : "Lưu sản phẩm"}</button>
            </form>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá hiện tại</th>
                    <th>Tồn kho</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong><br />
                        <span className="muted">{item.sku}</span>
                      </td>
                      <td>{item.categoryName}</td>
                      <td>{money.format(item.finalPrice)}</td>
                      <td>{item.stockQuantity}</td>
                      <td className="row-actions">
                        <button type="button" onClick={() => handleEditProduct(item)}>Sửa</button>
                        <button type="button" className="danger" onClick={() => handleDeleteProduct(item.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PRICES & PROMOTIONS SECTION */}
        {activeTab === 'prices' && (
          <section className="admin-section">
            <div className="section-title">
              <h2>Giá bán và khuyến mại</h2>
            </div>
            <div className="split">
              <form className="stack-form" onSubmit={handlePriceSubmit}>
                <h3>Cập nhật giá bán mới</h3>
                <label>Sản phẩm áp dụng
                  <select required value={priceProductId} onChange={(e) => setPriceProductId(e.target.value)}>
                    {products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label>Giá bán mới (VNĐ)
                  <input type="number" min="0" required placeholder="Nhập giá bán mới" value={priceNewVal} onChange={(e) => setPriceNewVal(e.target.value)} />
                </label>
                <label>Ngày bắt đầu áp dụng
                  <input type="date" required value={priceStartsAt} onChange={(e) => setPriceStartsAt(e.target.value)} />
                </label>
                <label>Ghi chú thay đổi
                  <input placeholder="Ví dụ: Điều chỉnh giá tháng 7" value={priceNote} onChange={(e) => setPriceNote(e.target.value)} />
                </label>
                <button type="submit">Cập nhật giá bán</button>
              </form>

              <form className="stack-form" onSubmit={handlePromotionSubmit}>
                <h3>{promoId ? "Chỉnh sửa khuyến mại" : "Tạo chương trình khuyến mại"}</h3>
                <label>Sản phẩm khuyến mại
                  <select required value={promoProductId} onChange={(e) => setPromoProductId(e.target.value)}>
                    {products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label>Tên chương trình khuyến mại
                  <input required placeholder="Ví dụ: Giảm giá mùa hè" value={promoName} onChange={(e) => setPromoName(e.target.value)} />
                </label>
                <label>Hình thức giảm giá
                  <select value={promoDiscountType} onChange={(e) => setPromoDiscountType(e.target.value)}>
                    <option value="percent">Giảm theo phần trăm (%)</option>
                    <option value="amount">Giảm theo số tiền cụ thể</option>
                  </select>
                </label>
                <label>Mức giảm giá
                  <input type="number" min="0" required placeholder="Nhập số tiền hoặc % giảm" value={promoDiscountValue} onChange={(e) => setPromoDiscountValue(e.target.value)} />
                </label>
                <label>Ngày bắt đầu
                  <input type="date" required value={promoStartsAt} onChange={(e) => setPromoStartsAt(e.target.value)} />
                </label>
                <label>Ngày kết thúc
                  <input type="date" required value={promoEndsAt} onChange={(e) => setPromoEndsAt(e.target.value)} />
                </label>
                <label>Trạng thái kích hoạt
                  <select value={promoStatus} onChange={(e) => setPromoStatus(e.target.value)}>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </label>
                <button type="submit">Lưu thông tin khuyến mại</button>
              </form>
            </div>

            <div className="table-wrap" style={{ marginTop: '20px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Chương trình khuyến mại</th>
                    <th>Mức giảm</th>
                    <th>Thời gian áp dụng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    const value = item.discountType === "percent" ? `${item.discountValue}%` : money.format(item.discountValue);
                    return (
                      <tr key={item.id}>
                        <td>{product ? product.name : ""}</td>
                        <td>
                          <strong>{item.name}</strong><br />
                          <span className="muted">{item.status === 'active' ? "Đang hoạt động" : "Ngừng hoạt động"}</span>
                        </td>
                        <td>{value}</td>
                        <td>{item.startsAt} - {item.endsAt}</td>
                        <td className="row-actions">
                          <button type="button" onClick={() => handleEditPromotion(item)}>Sửa</button>
                          <button type="button" className="danger" onClick={() => handleDeletePromotion(item.id)}>Xóa</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ORDERS SECTION */}
        {activeTab === 'orders' && (
          <section className="admin-section">
            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h2>Quản lý đơn hàng</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>Lọc theo trạng thái:</span>
                <select 
                  value={orderFilter} 
                  onChange={(e) => setOrderFilter(e.target.value)} 
                  style={{ width: 'auto', padding: '4px 8px', marginBottom: 0 }}
                  title="Lọc trạng thái đơn hàng"
                >
                  <option value="all">Tất cả đơn hàng</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Thông tin khách hàng</th>
                    <th>Đơn vị vận chuyển</th>
                    <th>Tổng thanh toán</th>
                    <th>Trạng thái đơn hàng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(item => orderFilter === 'all' || item.status === orderFilter).map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.orderCode}</strong><br />
                        <span className="muted">{item.createdAt || ""}</span>
                      </td>
                      <td>
                        {item.customerName}<br />
                        <span className="muted">{item.customerPhone} - {item.customerAddress}</span>
                      </td>
                      <td>{item.logisticsName || ""}</td>
                      <td>{money.format(item.grandTotal)}</td>
                      <td>
                        <select 
                          defaultValue={item.status} 
                          id={`select-status-${item.id}`}
                          title="Trạng thái đơn hàng"
                        >
                          {orderStatuses.map(status => (
                            <option key={status} value={status}>{orderStatusLabels[status] || status}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button 
                          type="button" 
                          onClick={() => {
                            const val = document.getElementById(`select-status-${item.id}`).value;
                            handleSaveOrderStatus(item.id, val);
                          }}
                          style={{ width: 'auto' }}
                        >
                          Lưu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* LOGISTICS SECTION */}
        {activeTab === 'logistics' && (
          <section className="admin-section">
            <div className="section-title">
              <h2>Đơn vị giao nhận</h2>
            </div>
            <form className="form-grid" onSubmit={handleLogisticsSubmit}>
              <label>Tên công ty giao nhận
                <input required placeholder="Ví dụ: Giao Hàng Nhanh" value={logName} onChange={(e) => setLogName(e.target.value)} />
              </label>
              <label>Mã định danh (Slug)
                <input placeholder="Ví dụ: giao-hang-nhanh" value={logSlug} onChange={(e) => setLogSlug(e.target.value)} />
              </label>
              <label>Số điện thoại liên hệ
                <input placeholder="Nhập số điện thoại công ty" value={logPhone} onChange={(e) => setLogPhone(e.target.value)} />
              </label>
              <label>Phí vận chuyển cơ bản (VNĐ)
                <input type="number" min="0" value={logBaseFee} onChange={(e) => setLogBaseFee(Number(e.target.value))} />
              </label>
              <label>Đánh giá xếp hạng
                <input type="number" min="0" max="5" step="0.1" value={logRating} onChange={(e) => setLogRating(Number(e.target.value))} />
              </label>
              <label>Trạng thái hoạt động
                <select value={logStatus} onChange={(e) => setLogStatus(e.target.value)}>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </label>
              <button type="submit">{logId ? "Cập nhật đơn vị" : "Lưu thông tin giao nhận"}</button>
            </form>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Đơn vị vận chuyển</th>
                    <th>Phí cơ bản</th>
                    <th>Đánh giá</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {logisticsCompanies.map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong><br />
                        <span className="muted">{item.phone || ""}</span>
                      </td>
                      <td>{money.format(item.baseFee || 0)}</td>
                      <td>{item.rating}</td>
                      <td>{item.status === 'active' ? "Đang hoạt động" : "Ngừng hoạt động"}</td>
                      <td className="row-actions">
                        <button type="button" onClick={() => handleEditLogistics(item)}>Sửa</button>
                        <button type="button" className="danger" onClick={() => handleDeleteLogistics(item.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* STORE PARTNERS SECTION */}
        {activeTab === 'partners' && (
          <section className="admin-section">
            <div className="section-title">
              <h2>Đối tác Cửa hàng - Giao nhận</h2>
            </div>
            <form className="form-grid" onSubmit={handlePartnerSubmit}>
              <label>Mã cửa hàng
                <input type="number" min="1" required placeholder="Nhập mã cửa hàng" value={partnerStoreId} onChange={(e) => setPartnerStoreId(Number(e.target.value))} />
              </label>
              <label>Công ty giao nhận đối tác
                <select required value={partnerLogisticsId} onChange={(e) => setPartnerLogisticsId(e.target.value)}>
                  {logisticsCompanies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>Phí vận chuyển cơ bản (VNĐ)
                <input type="number" min="0" value={partnerBaseFee} onChange={(e) => setPartnerBaseFee(Number(e.target.value))} />
              </label>
              <label>Phí phụ thu trên mỗi km (VNĐ/km)
                <input type="number" min="0" value={partnerFeePerKm} onChange={(e) => setPartnerFeePerKm(Number(e.target.value))} />
              </label>
              <label>Đánh giá xếp hạng đối tác
                <input type="number" min="0" max="5" step="0.1" value={partnerRating} onChange={(e) => setPartnerRating(Number(e.target.value))} />
              </label>
              <label>Trạng thái hợp tác
                <select value={partnerStatus} onChange={(e) => setPartnerStatus(e.target.value)}>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </label>
              <label className="wide">Khu vực phục vụ giao hàng
                <input placeholder="Ví dụ: Quận 1, Quận 3, TP. Hồ Chí Minh" value={partnerServiceArea} onChange={(e) => setPartnerServiceArea(e.target.value)} />
              </label>
              <button type="submit">{partnerId ? "Cập nhật đối tác" : "Lưu thông tin đối tác"}</button>
            </form>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Cửa hàng</th>
                    <th>Đơn vị giao nhận</th>
                    <th>Phí giao hàng</th>
                    <th>Khu vực phục vụ</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map(item => (
                    <tr key={item.id}>
                      <td>Cửa hàng #{item.storeId}</td>
                      <td>
                        <strong>{item.logisticsName}</strong><br />
                        <span className="muted">{item.status === 'active' ? "Đang hoạt động" : "Ngừng hoạt động"}</span>
                      </td>
                      <td>
                        {money.format(item.baseFee || 0)}<br />
                        <span className="muted">{money.format(item.feePerKm || 0)}/km</span>
                      </td>
                      <td>{item.serviceArea || ""}</td>
                      <td className="row-actions">
                        <button type="button" onClick={() => handleEditPartner(item)}>Sửa</button>
                        <button type="button" className="danger" onClick={() => handleDeletePartner(item.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* COMMENTS SECTION */}
        {activeTab === 'comments' && (
          <section className="admin-section">
            <div className="section-title">
              <h2>Quản lý bình luận & đánh giá</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Đánh giá</th>
                    <th>Nội dung bình luận</th>
                    <th>Thời gian</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>
                        Không có bình luận nào.
                      </td>
                    </tr>
                  ) : (
                    comments.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.customerName}</strong></td>
                        <td>{item.productName}</td>
                        <td style={{ color: 'var(--accent)' }}>
                          {"★".repeat(item.rating) + "☆".repeat(5 - item.rating)}
                        </td>
                        <td>{item.content}</td>
                        <td className="muted">
                          {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                        <td className="row-actions">
                          <button type="button" className="danger" onClick={() => handleDeleteComment(item.id)}>Xóa</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
