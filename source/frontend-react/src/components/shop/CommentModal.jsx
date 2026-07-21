import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { RatingStars } from '../common/RatingStars';
import { commentApi } from '../../api/commentApi';

export function CommentModal({ isOpen, onClose, product }) {
  const [comments, setComments] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadComments = useCallback(async () => {
    if (!product) return;
    try {
      const data = await commentApi.getByProductId(product.id);
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  }, [product]);

  useEffect(() => {
    if (isOpen && product) {
      loadComments();
    }
  }, [isOpen, product, loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    setErrorMsg('');

    try {
      await commentApi.addComment(product.id, {
        customerName,
        customerPhone,
        rating: Number(rating),
        content
      });

      setContent('');
      await loadComments();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Đánh giá & Bình luận: ${product.name}`}>
      <form className="stack-form" onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <h4>Viết đánh giá của bạn</h4>
        {errorMsg && <p style={{ color: 'var(--accent)' }}>{errorMsg}</p>}

        <label>Họ và tên (*)
          <input
            required
            placeholder="Nhập họ và tên"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </label>

        <label>Số điện thoại (*)
          <input
            required
            placeholder="Nhập số điện thoại"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </label>

        <label>Đánh giá xếp hạng (Sao)
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            <option value="5">★★★★★ (5/5 sao - Rất tốt)</option>
            <option value="4">★★★★☆ (4/5 sao - Tốt)</option>
            <option value="3">★★★☆☆ (3/5 sao - Bình thường)</option>
            <option value="2">★★☆☆☆ (2/5 sao - Tạm được)</option>
            <option value="1">★☆☆☆☆ (1/5 sao - Kém)</option>
          </select>
        </label>

        <label>Nội dung bình luận (*)
          <textarea
            required
            rows="3"
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm gia dụng này..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>

      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

      <h4>Bình luận từ khách hàng ({comments.length})</h4>
      <div className="comments-list" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '12px' }}>
        {comments.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Chưa có bình luận nào cho sản phẩm này.</p>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{c.customerName}</strong>
                <RatingStars rating={c.rating} />
              </div>
              <p style={{ margin: '6px 0 0 0', color: '#374151' }}>{c.content}</p>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                {new Date(c.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
