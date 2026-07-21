import React, { useState } from 'react';
import { orderApi } from '../../api/orderApi';
import { useAuthStore } from '../../stores/authStore';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

const STATUS_LABELS = {
  all: 'Tất cả đơn',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

export function OrderManager({ orders, onRefresh, activeFilter = 'all' }) {
  const [filter, setFilter] = useState(activeFilter);
  const token = useAuthStore(state => state.token);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatusAdmin(orderId, newStatus, token);
      await onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  return (
    <section className="admin-section">
      <div className="section-title">
        <h2>🛒 Quản lý Đơn hàng</h2>
      </div>

      <div className="admin-filter-pills">
        {Object.keys(STATUS_LABELS).map(st => (
          <button
            key={st}
            className={`admin-status-pill-btn ${filter === st ? 'active' : ''}`}
            onClick={() => setFilter(st)}
            type="button"
          >
            {STATUS_LABELS[st]}
            {st !== 'all' && (
              <span className="pill-count">
                {orders.filter(o => o.status === st).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Giao nhận</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textCenter: 'center', padding: '32px', color: '#64748b' }}>
                  Không có đơn hàng nào trong danh mục này.
                </td>
              </tr>
            ) : (
              filteredOrders.map(o => (
                <tr key={o.id}>
                  <td><strong className="order-code-text">#{o.orderCode}</strong></td>
                  <td>{o.customerName}</td>
                  <td>{o.customerPhone}</td>
                  <td>{o.logisticsName || 'Mặc định'}</td>
                  <td><strong className="order-price-text">{money.format(o.grandTotal)}</strong></td>
                  <td>
                    <span className={`status-badge status-${o.status}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="row-actions">
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                      className="status-select-input"
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="shipping">Đang giao hàng</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
