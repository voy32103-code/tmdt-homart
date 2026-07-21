import React from 'react';

export function SummaryCards({ summaryCounts }) {
  return (
    <section className="admin-top">
      <div className="admin-top-header">
        <h1>Quản lý bán hàng & Báo cáo</h1>
        <span className="admin-status-badge">⚡ Hệ thống đang hoạt động</span>
      </div>
      <div className="summary-grid">
        <div className="summary-card card">
          <div className="card-header">
            <span className="icon">📦</span>
            <span className="trend positive">+ Lực kho</span>
          </div>
          <div className="card-val">{summaryCounts.products || 0}</div>
          <div className="card-lbl">Sản phẩm đang kinh doanh</div>
        </div>

        <div className="summary-card card">
          <div className="card-header">
            <span className="icon">🗂️</span>
            <span className="trend neuter">Hoạt động</span>
          </div>
          <div className="card-val">{summaryCounts.categories || 0}</div>
          <div className="card-lbl">Danh mục sản phẩm</div>
        </div>

        <div className="summary-card card">
          <div className="card-header">
            <span className="icon">🔥</span>
            <span className="trend active">Đang diễn ra</span>
          </div>
          <div className="card-val">{summaryCounts.activePromotions || 0}</div>
          <div className="card-lbl">Chương trình khuyến mại</div>
        </div>

        <div className="summary-card card">
          <div className="card-header">
            <span className="icon">🚚</span>
            <span className="trend positive">Sẵn sàng</span>
          </div>
          <div className="card-val">{summaryCounts.logisticsCompanies || 0}</div>
          <div className="card-lbl">Đơn vị giao nhận</div>
        </div>
      </div>
    </section>
  );
}
