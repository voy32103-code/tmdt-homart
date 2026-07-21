import React from 'react';
import { ProductCard } from './ProductCard';

export function ProductGrid({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  products,
  onAddToCart,
  onViewDetail,
  onOpenComment
}) {
  return (
    <section className="shop-section">
      <div className="filter-bar card">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm thiết bị gia dụng, nồi chiên, máy lọc..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-pills">
          <button
            className={`pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onSelectCategory('all')}
            type="button"
          >
            Tất cả danh mục
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`pill ${selectedCategory === String(cat.id) ? 'active' : ''}`}
              onClick={() => onSelectCategory(String(cat.id))}
              type="button"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="results-header">
        <span className="results-count">Hiển thị {products.length} sản phẩm</span>
      </div>

      {products.length === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon">📦</span>
          <h3>Không tìm thấy sản phẩm nào</h3>
          <p>Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục sản phẩm khác.</p>
          <button
            type="button"
            className="btn-reset-filter"
            onClick={() => {
              onSearchChange('');
              onSelectCategory('all');
            }}
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetail={onViewDetail}
              onOpenComment={onOpenComment}
            />
          ))}
        </div>
      )}
    </section>
  );
}
