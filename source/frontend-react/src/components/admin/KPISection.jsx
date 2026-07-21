import React from 'react';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function KPISection({ overviewKpis, onSelectTab, onSetOrderFilter }) {
  return (
    <div className="kpi-grid" style={{ marginTop: '20px' }}>
      <div className="kpi-card">
        <div className="kpi-label">Tổng doanh thu</div>
        <div className="kpi-value">{money.format(overviewKpis.totalRevenue || 0)}</div>
      </div>
      <div
        className="kpi-card"
        onClick={() => {
          onSelectTab('orders');
          onSetOrderFilter('all');
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="kpi-label">Tổng số đơn hàng</div>
        <div className="kpi-value">{overviewKpis.totalOrders || 0}</div>
      </div>
      <div
        className="kpi-card"
        onClick={() => {
          onSelectTab('orders');
          onSetOrderFilter('completed');
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="kpi-label">Đơn hoàn thành</div>
        <div className="kpi-value kpi-success">{overviewKpis.completedOrders || 0}</div>
      </div>
      <div
        className="kpi-card"
        onClick={() => {
          onSelectTab('orders');
          onSetOrderFilter('cancelled');
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="kpi-label">Đơn bị hủy</div>
        <div className="kpi-value kpi-danger">{overviewKpis.cancelledOrders || 0}</div>
      </div>
    </div>
  );
}
