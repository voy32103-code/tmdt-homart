import React, { useState, useEffect, useCallback } from 'react';
import { logisticsApi } from '../../api/logisticsApi';
import { useAuthStore } from '../../stores/authStore';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function LogisticsManager() {
  const [companies, setCompanies] = useState([]);
  const [compId, setCompId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [baseFee, setBaseFee] = useState(30000);
  const [rating, setRating] = useState(5);
  const token = useAuthStore(state => state.token);

  const loadCompanies = useCallback(async () => {
    try {
      const data = await logisticsApi.getAllCompaniesAdmin(token);
      setCompanies(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        phone,
        baseFee: Number(baseFee),
        rating: Number(rating)
      };

      if (compId) {
        await logisticsApi.updateCompany(compId, payload, token);
      } else {
        await logisticsApi.createCompany(payload, token);
      }

      setCompId('');
      setName('');
      setSlug('');
      setPhone('');
      setBaseFee(30000);
      setRating(5);
      await loadCompanies();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (c) => {
    setCompId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setPhone(c.phone || '');
    setBaseFee(c.baseFee);
    setRating(c.rating);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đơn vị giao nhận này?')) return;
    try {
      await logisticsApi.deleteCompany(id, token);
      await loadCompanies();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="admin-section">
      <div className="section-title">
        <h2>Đơn vị giao nhận</h2>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>Tên đơn vị vận chuyển
          <input required placeholder="VD: Giao Hàng Nhanh (GHN)" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>Mã định danh (Slug)
          <input placeholder="VD: ghn" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </label>
        <label>Số điện thoại liên hệ
          <input placeholder="1900 1234" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>Cước phí cơ bản (VNĐ)
          <input type="number" value={baseFee} onChange={(e) => setBaseFee(Number(e.target.value))} />
        </label>
        <label>Đánh giá chất lượng (1-5)
          <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
        </label>
        <button type="submit">{compId ? 'Cập nhật đơn vị' : 'Lưu đơn vị giao nhận'}</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tên đơn vị</th>
              <th>Mã Slug</th>
              <th>Điện thoại</th>
              <th>Cước cơ bản</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.phone || 'N/A'}</td>
                <td>{money.format(c.baseFee)}</td>
                <td>★ {c.rating}</td>
                <td><span className={`status-badge status-${c.status}`}>{c.status}</span></td>
                <td className="row-actions">
                  <button type="button" onClick={() => handleEdit(c)}>Sửa</button>
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
