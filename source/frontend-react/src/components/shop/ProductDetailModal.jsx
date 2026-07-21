import React from 'react';
import { Modal } from '../common/Modal';
import { RatingStars } from '../common/RatingStars';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function ProductDetailModal({ isOpen, onClose, product, onAddToCart }) {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết sản phẩm: ${product.name}`}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }}
          />
        </div>
        <div>
          <span className="product-category">{product.categoryName}</span>
          <h2 style={{ fontSize: '20px', margin: '8px 0' }}>{product.name}</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0' }}>Mã SKU: {product.sku}</p>
          {product.brand && <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0' }}>Thương hiệu: {product.brand}</p>}

          <div style={{ margin: '12px 0' }}>
            <RatingStars rating={product.averageRating} count={product.commentCount} />
          </div>

          <div style={{ margin: '16px 0' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>
              {money.format(product.finalPrice)}
            </span>
            {product.hasDiscount && (
              <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginLeft: '12px' }}>
                {money.format(product.price)}
              </span>
            )}
          </div>

          <p style={{ margin: '12px 0', lineHeight: '1.5' }}>{product.shortDescription || product.description || 'Không có mô tả chi tiết.'}</p>

          <p style={{ fontSize: '14px', margin: '12px 0' }}>
            Tồn kho: <strong>{product.stockQuantity > 0 ? `${product.stockQuantity} sản phẩm` : 'Hết hàng'}</strong>
          </p>

          <button
            type="button"
            className="btn-add-cart"
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            disabled={product.stockQuantity <= 0}
          >
            {product.stockQuantity > 0 ? 'Thêm vào Giỏ hàng' : 'Hết hàng'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
