import React from 'react';
import { RatingStars } from '../common/RatingStars';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function ProductCard({ product, onAddToCart, onViewDetail, onOpenComment }) {
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className={`product-card card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="product-image-wrap" onClick={() => onViewDetail(product)}>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.hasDiscount && (
          <span className="badge-discount">{product.discountText}</span>
        )}
        {isOutOfStock && (
          <div className="stock-overlay">Hết hàng</div>
        )}
      </div>
      <div className="product-info">
        <span className="product-category">{product.categoryName || 'Gia dụng'}</span>
        <h3 className="product-name" onClick={() => onViewDetail(product)} title={product.name}>
          {product.name}
        </h3>
        <div className="product-rating">
          <RatingStars rating={product.averageRating} count={product.commentCount} />
        </div>
        <div className="product-price-row">
          <div className="price-wrap">
            <span className="final-price">{money.format(product.finalPrice)}</span>
            {product.hasDiscount && (
              <span className="original-price">{money.format(product.price)}</span>
            )}
          </div>
        </div>
        <div className="product-card-actions">
          <button
            type="button"
            className="btn-add-cart"
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Hết hàng' : '+ Thêm vào giỏ'}
          </button>
          <button
            type="button"
            className="btn-comment"
            onClick={() => onOpenComment(product)}
            title="Đánh giá & Bình luận"
          >
            💬
          </button>
        </div>
      </div>
    </div>
  );
}
