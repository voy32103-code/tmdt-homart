import React, { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from './components/admin/AdminHeader';
import { SummaryCards } from './components/admin/SummaryCards';
import { KPISection } from './components/admin/KPISection';
import { RevenueCharts } from './components/admin/RevenueCharts';
import { CategoryManager } from './components/admin/CategoryManager';
import { ProductManager } from './components/admin/ProductManager';
import { PricePromotionManager } from './components/admin/PricePromotionManager';
import { OrderManager } from './components/admin/OrderManager';
import { LogisticsManager } from './components/admin/LogisticsManager';
import { PartnerManager } from './components/admin/PartnerManager';
import { CommentManager } from './components/admin/CommentManager';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useAuthStore } from './stores/authStore';
import { useReports } from './hooks/useReports';
import { authApi } from './api/authApi';
import { productApi } from './api/productApi';
import { categoryApi } from './api/categoryApi';
import { orderApi } from './api/orderApi';

export default function AdminApp() {
  const { token, setToken } = useAuthStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginMsg, setLoginMsg] = useState('');
  const [activeTab, setActiveTab] = useState('reports');
  const [orderFilter, setOrderFilter] = useState('all');

  const [summaryCounts, setSummaryCounts] = useState({});
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter dates
  const [reportFromDate, setReportFromDate] = useState('');
  const [reportToDate, setReportToDate] = useState('');

  const {
    overviewKpis,
    revenueByDate,
    topProducts,
    revenueByCategory,
    orderStatusSummary,
    fetchReports
  } = useReports(reportFromDate, reportToDate);

  const loadAdminData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sum, cats, prods, ords] = await Promise.all([
        productApi.getSummary(token),
        categoryApi.getAll(),
        productApi.getAll(),
        orderApi.getAllAdmin(token)
      ]);
      setSummaryCounts(sum);
      setCategories(cats);
      setProducts(prods);
      setOrders(ords);
      await fetchReports();
    } catch (err) {
      console.error(err);
      if (err.message.includes('Token') || err.message.includes('expired')) {
        setToken('');
      }
    } finally {
      setLoading(false);
    }
  }, [token, fetchReports, setToken]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMsg('');
    try {
      const res = await authApi.login(username, password);
      setToken(res.token);
    } catch (err) {
      setLoginMsg(err.message);
    }
  };

  if (!token) {
    return (
      <div className="admin-login-wrapper">
        <header className="site-header admin-site-header">
          <a className="brand" href="/">
            <span className="brand-icon">⚡</span>
            <span>HomeMart Portal</span>
          </a>
          <nav>
            <a href="/" className="nav-button btn-store-link">🏪 Xem Cửa hàng</a>
          </nav>
        </header>

        <main className="login-panel">
          <div className="login-card-container">
            <div className="login-card-header">
              <div className="login-logo-icon">⚡</div>
              <h2>Đăng nhập Portal Quản trị</h2>
              <p>Hệ thống Quản lý Bán hàng & Logistics Gia dụng</p>
            </div>

            <form className="stack-form login-form" onSubmit={handleLogin}>
              {loginMsg && <div className="login-error-alert">⚠️ {loginMsg}</div>}
              
              <div className="form-group">
                <label>Tài khoản Quản trị</label>
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                />
              </div>

              <button type="submit" className="btn-login-submit">
                Đăng nhập ngay ➔
              </button>

              <div className="login-footer-note">
                🔒 Kết nối được bảo mật 256-bit SSL | HomeMart Admin System
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: 'reports', label: 'Báo cáo doanh thu', icon: '📊' },
    { id: 'categories', label: 'Danh mục', icon: '📁' },
    { id: 'products', label: 'Sản phẩm', icon: '📦' },
    { id: 'prices', label: 'Giá & Khuyến mại', icon: '🏷️' },
    { id: 'orders', label: 'Đơn hàng', icon: '🛒' },
    { id: 'logistics', label: 'Giao nhận', icon: '🚚' },
    { id: 'partners', label: 'Đối tác liên kết', icon: '🤝' },
    { id: 'comments', label: 'Bình luận', icon: '💬' }
  ];

  return (
    <div className="admin-layout">
      <AdminHeader />

      <main className="container main-content admin-main-content">
        <SummaryCards summaryCounts={summaryCounts} />

        {/* Tab Navigation */}
        <div className="admin-tabs-bar">
          <div className="admin-tabs-scroll">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading && <LoadingSpinner text="Đang nạp dữ liệu quản trị..." />}

        {!loading && (
          <div className="admin-tab-content">
            {activeTab === 'reports' && (
              <section className="admin-section">
                <div className="report-filters-card">
                  <h3 className="filter-title">📅 Bộ lọc Báo cáo theo Thời gian</h3>
                  <div className="filter-grid">
                    <div className="filter-item">
                      <label>Từ ngày</label>
                      <input
                        type="date"
                        value={reportFromDate}
                        onChange={(e) => setReportFromDate(e.target.value)}
                      />
                    </div>
                    <div className="filter-item">
                      <label>Đến ngày</label>
                      <input
                        type="date"
                        value={reportToDate}
                        onChange={(e) => setReportToDate(e.target.value)}
                      />
                    </div>
                    <button type="button" onClick={fetchReports} className="btn-filter-submit">
                      🔍 Lọc dữ liệu
                    </button>
                  </div>
                </div>

                <KPISection
                  overviewKpis={overviewKpis}
                  onSelectTab={setActiveTab}
                  onSetOrderFilter={setOrderFilter}
                />

                <RevenueCharts
                  revenueByDate={revenueByDate}
                  topProducts={topProducts}
                  revenueByCategory={revenueByCategory}
                  orderStatusSummary={orderStatusSummary}
                />
              </section>
            )}

            {activeTab === 'categories' && (
              <CategoryManager categories={categories} onRefresh={loadAdminData} />
            )}

            {activeTab === 'products' && (
              <ProductManager products={products} categories={categories} onRefresh={loadAdminData} />
            )}

            {activeTab === 'prices' && (
              <PricePromotionManager products={products} onRefresh={loadAdminData} />
            )}

            {activeTab === 'orders' && (
              <OrderManager orders={orders} onRefresh={loadAdminData} activeFilter={orderFilter} />
            )}

            {activeTab === 'logistics' && (
              <LogisticsManager />
            )}

            {activeTab === 'partners' && (
              <PartnerManager />
            )}

            {activeTab === 'comments' && (
              <CommentManager />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
