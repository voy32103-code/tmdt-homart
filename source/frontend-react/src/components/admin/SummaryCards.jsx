import React from 'react';

export function SummaryCards({ summaryCounts }) {
  return (
    <section className="admin-top">
      <div className="admin-top-header">
        <div>
          <h1 className="admin-dashboard-title">Tổng quan Hệ thống & Báo cáo</h1>
          <p className="admin-dashboard-sub">
            Theo dõi chỉ số kinh doanh, tồn kho và tiến độ xử lý đơn hàng theo thời gian thực.
          </p>
        </div>
        <div className="admin-status-pill">
          <span className="pulse-dot"></span>
          <span>Hệ thống đang hoạt động</span>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card card-products">
          <div className="card-header">
            <span className="icon">📦</span>
            <span className="trend positive">Sẵn sàng bán</span>
          </div>
          <div className="card-val">{(summaryCounts.products || 0).toLocaleString('vi-VN')}</div>
          <div className="card-lbl">Sản phẩm trong kho</div>
        </div>

        <div className="summary-card card card-categories">
          <div className="card-header">
            <span className="icon">🗂️</span>
            <span className="trend neuter">Phân loại</span>
          </div>
          <div className="card-val">{(summaryCounts.categories || 0).toLocaleString('vi-VN')}</div>
          <div className="card-lbl">Danh mục sản phẩm</div>
        </div>

        <div className="summary-card card card-promotions">
          <div className="card-header">
            <span className="icon">🔥</span>
            <span className="trend active">Đang ưu đãi</span>
          </div>
          <div className="card-val">{(summaryCounts.activePromotions || 0).toLocaleString('vi-VN')}</div>
          <div className="card-lbl">Chương trình khuyến mại</div>
        </div>

        <div className="summary-card card card-logistics">
          <div className="card-header">
            <span className="icon">🚚</span>
            <span className="trend positive">Đối tác vận chuyển</span>
          </div>
          <div className="card-val">{(summaryCounts.logisticsCompanies || 0).toLocaleString('vi-VN')}</div>
          <div className="card-lbl">Đơn vị giao nhận</div>
        </div>
      </div>
    </section>
  );
}
