import React, { useEffect, useState } from 'react';
import { vnpayApi } from '../../api/vnpayApi';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function PaymentCallback({ onReturnHome }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const search = window.location.search;
    if (!search) {
      setLoading(false);
      setError('Không tìm thấy thông tin phản hồi từ VNPAY.');
      return;
    }

    vnpayApi.verifyCallback(search)
      .then(res => {
        setResult(res.data);
      })
      .catch(err => {
        setError(err.message || 'Xác thực thanh toán VNPAY thất bại.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textCenter: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '40px', textCenter: 'center', borderRadius: '16px' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }}>⚡</div>
          <h2>Đang xử lý kết quả thanh toán VNPAY...</h2>
          <p style={{ color: '#64748b' }}>Vui lòng giữ nguyên màn hình trong giây lát.</p>
        </div>
      </div>
    );
  }

  const isSuccess = result && result.isSuccess;

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '640px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '36px', borderRadius: '16px', textCenter: 'center', border: isSuccess ? '2px solid #10b981' : '2px solid #ef4444' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>
          {isSuccess ? '🎉' : '❌'}
        </div>

        <h1 style={{ color: isSuccess ? '#047857' : '#b91c1c', fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>
          {isSuccess ? 'Thanh toán VNPAY Thành Công!' : 'Thanh toán VNPAY Thất Bại hoặc Bị Hủy'}
        </h1>

        <p style={{ color: '#475569', fontSize: '15px', marginBottom: '24px' }}>
          {isSuccess
            ? 'Đơn hàng của bạn đã được thanh toán trực tuyến thành công qua cổng VNPAY. Hệ thống đã xác nhận đơn hàng!'
            : error || 'Giao dịch thanh toán chưa hoàn tất hoặc đã bị hủy bởi người dùng.'}
        </p>

        {result && (
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '28px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #cbd5e1' }}>
              <span style={{ color: '#64748b' }}>Mã đơn hàng:</span>
              <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>#{result.orderCode}</strong>
            </div>

            {result.transactionNo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #cbd5e1' }}>
                <span style={{ color: '#64748b' }}>Mã giao dịch VNPAY:</span>
                <strong>{result.transactionNo}</strong>
              </div>
            )}

            {result.bankCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #cbd5e1' }}>
                <span style={{ color: '#64748b' }}>Ngân hàng thanh toán:</span>
                <strong>{result.bankCode}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
              <span style={{ color: '#64748b' }}>Số tiền thanh toán:</span>
              <strong style={{ color: '#059669', fontSize: '16px' }}>{money.format(result.amount)}</strong>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onReturnHome}
          className="btn-primary-lg"
          style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '700', borderRadius: '10px' }}
        >
          🏠 Quay lại Trang Chủ HomeMart
        </button>
      </div>
    </div>
  );
}
