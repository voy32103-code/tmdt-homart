import React, { useState } from 'react';
import { orderApi } from '../../api/orderApi';
import { useAuthStore } from '../../stores/authStore';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

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
        <h2>Quản lý đơn hàng</h2>
      </div>

      <div className="category-pills" style={{ marginBottom: '16px' }}>
        {['all', 'pending', 'confirmed', 'processing', 'shipping', 'completed', 'cancelled'].map(st => (
          <button
            key={st}
            className={`pill ${filter === st ? 'active' : ''}`}
            onClick={() => setFilter(st)}
            type="button"
          >
            {st === 'all' ? 'Tất cả' : st}
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
            {filteredOrders.map(o => (
              <tr key={o.id}>
                <td><strong>{o.orderCode}</strong></td>
                <td>{o.customerName}</td>
                <td>{o.customerPhone}</td>
                <td>{o.logisticsName}</td>
                <td><strong>{money.format(o.grandTotal)}</strong></td>
                <td>
                  <span className={`status-badge status-${o.status}`}>{o.status}</span>
                </td>
                <td>{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                    style={{ padding: '4px', fontSize: '13px' }}
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
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
