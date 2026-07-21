import React, { useState, useEffect, useCallback } from 'react';
import { commentApi } from '../../api/commentApi';
import { RatingStars } from '../common/RatingStars';
import { useAuthStore } from '../../stores/authStore';

export function CommentManager() {
  const [comments, setComments] = useState([]);
  const token = useAuthStore(state => state.token);

  const loadComments = useCallback(async () => {
    try {
      const data = await commentApi.getAllAdmin(token);
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) return;
    try {
      await commentApi.deleteAdmin(id, token);
      await loadComments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="admin-section">
      <div className="section-title">
        <h2>Kiểm duyệt bình luận & Đánh giá</h2>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Xếp hạng</th>
              <th>Nội dung bình luận</th>
              <th>Ngày gửi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {comments.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td><strong>{c.productName}</strong></td>
                <td>{c.customerName}</td>
                <td>{c.customerPhone}</td>
                <td><RatingStars rating={c.rating} /></td>
                <td>{c.content}</td>
                <td>{new Date(c.createdAt).toLocaleString('vi-VN')}</td>
                <td>
                  <button type="button" className="danger" onClick={() => handleDelete(c.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
