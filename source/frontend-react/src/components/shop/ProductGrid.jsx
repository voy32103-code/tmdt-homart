import React from 'react';
import { ProductCard } from './ProductCard';

export function ProductGrid({
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  products = [],
  onAddToCart,
  onViewDetail,
  onOpenComment
}) {
  const categoryList = Array.isArray(categories) ? categories : [];
  const productList = Array.isArray(products) ? products : [];

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

        <div className="category-select-wrap">
          <span className="select-icon">🏷️</span>
          <select
            className="category-droplist"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            aria-label="Chọn danh mục sản phẩm"
          >
            <option value="all">-- Tất cả danh mục gia dụng --</option>
            {categoryList.map(cat => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-header">
        <span className="results-count">Hiển thị {productList.length} sản phẩm</span>
        {selectedCategory !== 'all' && (
          <button
            type="button"
            className="clear-category-tag"
            onClick={() => onSelectCategory('all')}
          >
            Bỏ lọc danh mục ✕
          </button>
        )}
      </div>

      {productList.length === 0 ? (
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
          {productList.map(product => (
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
