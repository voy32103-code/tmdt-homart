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
      <div>
        <header className="site-header">
          <a className="brand" href="/">HomeMart Admin</a>
          <nav>
            <a href="/">Cửa hàng</a>
          </nav>
        </header>
        <main className="login-panel" style={{ display: 'flex', justifyContent: 'center', padding: '60px 16px' }}>
          <form className="stack-form login-form card" onSubmit={handleLogin} style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h2>Đăng nhập Hệ thống Quản trị</h2>
            {loginMsg && <p style={{ color: 'var(--accent)' }}>{loginMsg}</p>}
            <label>Tài khoản
              <input required value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label>Mật khẩu
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button type="submit" style={{ marginTop: '12px' }}>Đăng nhập ngay</button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminHeader />

      <main className="container main-content" style={{ minHeight: '80vh', padding: '24px 16px' }}>
        <SummaryCards summaryCounts={summaryCounts} />

        <div className="admin-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', margin: '20px 0' }}>
          {[
            { id: 'reports', label: 'Báo cáo doanh thu' },
            { id: 'categories', label: 'Danh mục' },
            { id: 'products', label: 'Sản phẩm' },
            { id: 'prices', label: 'Giá & Khuyến mại' },
            { id: 'orders', label: 'Đơn hàng' },
            { id: 'logistics', label: 'Giao nhận' },
            { id: 'partners', label: 'Đối tác liên kết' },
            { id: 'comments', label: 'Bình luận' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && <LoadingSpinner text="Đang nạp dữ liệu quản trị..." />}

        {!loading && (
          <>
            {activeTab === 'reports' && (
              <section className="admin-section">
                <div className="report-filters card" style={{ padding: '16px', marginBottom: '20px' }}>
                  <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto', alignItems: 'flex-end', gap: '16px' }}>
                    <label>Từ ngày
                      <input type="date" value={reportFromDate} onChange={(e) => setReportFromDate(e.target.value)} />
                    </label>
                    <label>Đến ngày
                      <input type="date" value={reportToDate} onChange={(e) => setReportToDate(e.target.value)} />
                    </label>
                    <button type="button" onClick={fetchReports} style={{ width: 'auto' }}>Lọc dữ liệu</button>
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
          </>
        )}
      </main>
    </div>
  );
}
