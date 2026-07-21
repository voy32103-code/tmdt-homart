import React from 'react';

export function LoadingSpinner({ text = 'Đang tải dữ liệu...' }) {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#6b7280' }}>
      <div className="spinner" style={{ marginBottom: '8px' }}>⏳</div>
      <p>{text}</p>
    </div>
  );
}
