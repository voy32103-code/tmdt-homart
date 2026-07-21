import React from 'react';

export function RatingStars({ rating = 5, count }) {
  const rounded = Math.round(rating);
  return (
    <div className="rating-stars" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
      <span>{'★'.repeat(rounded) + '☆'.repeat(5 - rounded)}</span>
      <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '4px' }}>
        {rating} {count !== undefined && `(${count})`}
      </span>
    </div>
  );
}
