import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useCartStore } from '../../stores/cartStore';
import { orderApi } from '../../api/orderApi';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function CheckoutModal({ isOpen, onClose, logisticsCompanies, onSuccess }) {
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [logisticsCompanyId, setLogisticsCompanyId] = useState(logisticsCompanies[0] ? String(logisticsCompanies[0].id) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const payload = {
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        customerAddress,
        logisticsCompanyId: logisticsCompanyId ? Number(logisticsCompanyId) : undefined,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const result = await orderApi.create(payload);
      clearCart();
      onSuccess(result);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thông tin Đặt hàng">
      <form className="stack-form" onSubmit={handleSubmit}>
        {errorMsg && <p style={{ color: 'var(--accent)', fontWeight: 600 }}>{errorMsg}</p>}

        <label>Họ và tên khách hàng (*)
          <input
            required
            placeholder="Nhập họ và tên đầy đủ"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </label>

        <label>Số điện thoại (*)
          <input
            required
            placeholder="Nhập số điện thoại nhận hàng"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </label>

        <label>Email (Không bắt buộc)
          <input
            type="email"
            placeholder="Nhập địa chỉ email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </label>

        <label>Địa chỉ nhận hàng (*)
          <input
            required
            placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </label>

        <label>Đơn vị vận chuyển
          <select
            value={logisticsCompanyId}
            onChange={(e) => setLogisticsCompanyId(e.target.value)}
          >
            {logisticsCompanies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name} - Phí giao: {money.format(company.baseFee)}
              </option>
            ))}
          </select>
        </label>

        <div className="order-summary-box">
          <p>Số lượng sản phẩm: <strong>{cart.reduce((s, i) => s + i.quantity, 0)}</strong></p>
          <p>Tạm tính: <strong>{money.format(getTotalPrice())}</strong></p>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý đơn hàng...' : 'Xác nhận Đặt hàng'}
        </button>
      </form>
    </Modal>
  );
}
