import React, { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, title, children }) {
  // Khi Modal vừa mount, từ chối đóng trong 200ms đầu để tránh
  // click/mousedown từ nút trigger lan vào overlay ngay lập tức.
  const canCloseRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      canCloseRef.current = false;
      return;
    }
    canCloseRef.current = false;
    const timer = setTimeout(() => {
      canCloseRef.current = true;
    }, 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && canCloseRef.current) {
          onClose();
        }
      }}
    >
      <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose} type="button">×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
