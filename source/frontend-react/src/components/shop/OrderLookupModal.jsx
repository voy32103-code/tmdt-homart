import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { orderApi } from '../../api/orderApi';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function OrderLookupModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setResults(null);

    try {
      if (query.toUpperCase().startsWith('HM-')) {
        const order = await orderApi.getByCode(query.trim());
        setResults([order]);
      } else {
        const orders = await orderApi.getByPhone(query.trim());
        setResults(orders);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tra cứu lịch sử Đơn hàng">
      <form onSubmit={handleLookup} className="stack-form">
        <label>Nhập Số điện thoại hoặc Mã đơn hàng (HM-...)
          <input
            required
            placeholder="Ví dụ: 0988123456 hoặc HM-123456-789"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Đang tìm kiếm...' : 'Tra cứu ngay'}
        </button>
      </form>

      {errorMsg && <p style={{ color: 'var(--accent)', marginTop: '16px' }}>{errorMsg}</p>}

      {results && results.length === 0 && (
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Không tìm thấy đơn hàng phù hợp.</p>
      )}

      {results && results.length > 0 && (
        <div className="order-results-list" style={{ marginTop: '20px' }}>
          {results.map(order => (
            <div key={order.id} className="card" style={{ marginBottom: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>{order.orderCode}</strong>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>Khách hàng: {order.customerName} ({order.customerPhone})</p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>Tổng tiền: <strong>{money.format(order.grandTotal)}</strong></p>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>
                Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
