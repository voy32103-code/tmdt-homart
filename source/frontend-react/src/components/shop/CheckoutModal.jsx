import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useCartStore } from '../../stores/cartStore';
import { orderApi } from '../../api/orderApi';
import { vnpayApi } from '../../api/vnpayApi';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function CheckoutModal({ isOpen, onClose, logisticsCompanies, onSuccess }) {
  const companies = Array.isArray(logisticsCompanies) ? logisticsCompanies : [];
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [logisticsCompanyId, setLogisticsCompanyId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('VNPAY'); // Mặc định VNPAY

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (companies.length > 0 && !logisticsCompanyId) {
      setLogisticsCompanyId(String(companies[0].id));
    }
  }, [companies]);


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
          productId: Number(item.productId),
          quantity: Number(item.quantity)
        }))
      };

      // 1. Tạo đơn hàng trong cơ sở dữ liệu
      const order = await orderApi.create(payload);

      // 2. Nếu chọn thanh toán VNPAY -> Gọi backend tạo URL thanh toán
      if (paymentMethod === 'VNPAY') {
        const vnpayRes = await vnpayApi.createPaymentUrl({
          orderCode: order.orderCode,
          amount: order.grandTotal,
          orderInfo: `Thanh toan don hang ${order.orderCode}`
        });

        if (vnpayRes && vnpayRes.paymentUrl) {
          clearCart();
          onClose();
          // Chuyển hướng người dùng sang Cổng thanh toán VNPAY Sandbox
          window.location.href = vnpayRes.paymentUrl;
          return;
        } else {
          throw new Error('Không thể tạo liên kết thanh toán VNPAY.');
        }
      }

      // 3. Nếu là COD -> Thanh toán bình thường
      clearCart();
      onSuccess(order);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thông tin Đặt hàng & Thanh toán">
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

        <div className="form-row-2">
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
        </div>

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
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name} - Phí giao: {money.format(company.baseFee)}
              </option>
            ))}
          </select>
        </label>

        {/* Phương thức thanh toán */}
        <div style={{ marginTop: '12px' }}>
          <label style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>
            Phương thức thanh toán (*)
          </label>
          <div className="payment-methods-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className={`payment-option-card ${paymentMethod === 'COD' ? 'selected' : ''}`} style={{
              border: paymentMethod === 'COD' ? '2px solid var(--primary)' : '1fr solid #cbd5e1',
              background: paymentMethod === 'COD' ? '#ecfdf5' : '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              <div>
                <strong>💵 COD</strong>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Thanh toán tiền mặt khi nhận hàng</p>
              </div>
            </label>

            <label className={`payment-option-card ${paymentMethod === 'VNPAY' ? 'selected' : ''}`} style={{
              border: paymentMethod === 'VNPAY' ? '2px solid #0284c7' : '1px solid #cbd5e1',
              background: paymentMethod === 'VNPAY' ? '#f0f9ff' : '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="VNPAY"
                checked={paymentMethod === 'VNPAY'}
                onChange={() => setPaymentMethod('VNPAY')}
              />
              <div>
                <strong>💳 Cổng VNPAY</strong>
                <p style={{ margin: 0, fontSize: '12px', color: '#0284c7' }}>Thẻ ATM, QR Code, VNPAY App</p>
              </div>
            </label>
          </div>
        </div>

        <div className="order-summary-box" style={{ marginTop: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
          <p>Số lượng sản phẩm: <strong>{cart.reduce((s, i) => s + i.quantity, 0)}</strong></p>
          <p>Tổng thanh toán: <strong style={{ color: 'var(--primary)', fontSize: '18px' }}>{money.format(getTotalPrice())}</strong></p>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary-admin" style={{ width: '100%', marginTop: '12px' }}>
          {isSubmitting
            ? 'Đang xử lý đơn hàng...'
            : paymentMethod === 'VNPAY'
            ? '🌐 Thanh toán qua VNPAY ➔'
            : 'Xác nhận Đặt hàng (COD)'}
        </button>
      </form>
    </Modal>
  );
}
