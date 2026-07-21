import React from 'react';

export function SummaryCards({ summaryCounts }) {
  return (
    <section className="admin-top">
      <h1>Quản lý bán hàng</h1>
      <div className="summary">
        <div><strong>{summaryCounts.products || 0}</strong>Sản phẩm</div>
        <div><strong>{summaryCounts.categories || 0}</strong>Danh mục</div>
        <div><strong>{summaryCounts.activePromotions || 0}</strong>Khuyến mại</div>
        <div><strong>{summaryCounts.logisticsCompanies || 0}</strong>Giao nhận</div>
      </div>
    </section>
  );
}
