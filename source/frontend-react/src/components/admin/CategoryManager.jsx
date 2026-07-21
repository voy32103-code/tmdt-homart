import React, { useState } from 'react';
import { categoryApi } from '../../api/categoryApi';
import { useAuthStore } from '../../stores/authStore';

export function CategoryManager({ categories, onRefresh }) {
  const [catId, setCatId] = useState('');
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catSort, setCatSort] = useState(0);
  const [catSeoTitle, setCatSeoTitle] = useState('');
  const [catSeoDesc, setCatSeoDesc] = useState('');
  const token = useAuthStore(state => state.token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sortOrder: Number(catSort),
        seoTitle: catSeoTitle,
        seoDescription: catSeoDesc
      };
      if (catId) {
        await categoryApi.update(catId, payload, token);
      } else {
        await categoryApi.create(payload, token);
      }
      setCatId('');
      setCatName('');
      setCatSlug('');
      setCatSort(0);
      setCatSeoTitle('');
      setCatSeoDesc('');
      await onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (item) => {
    setCatId(item.id);
    setCatName(item.name);
    setCatSlug(item.slug);
    setCatSort(item.sortOrder);
    setCatSeoTitle(item.seoTitle || '');
    setCatSeoDesc(item.seoDescription || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) return;
    try {
      await categoryApi.delete(id, token);
      await onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="admin-section">
      <div className="section-title">
        <h2>Danh mục sản phẩm</h2>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>Tên danh mục
          <input required placeholder="Ví dụ: Đồ dùng nhà bếp" value={catName} onChange={(e) => setCatName(e.target.value)} />
        </label>
        <label>Đường dẫn SEO (Slug)
          <input placeholder="Ví dụ: do-dung-nha-bep" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
        </label>
        <label>Thứ tự hiển thị
          <input type="number" value={catSort} onChange={(e) => setCatSort(Number(e.target.value))} />
        </label>
        <label>Tiêu đề SEO (Title)
          <input placeholder="Tiêu đề hiển thị trên trình duyệt" value={catSeoTitle} onChange={(e) => setCatSeoTitle(e.target.value)} />
        </label>
        <label className="wide">Mô tả SEO (Description)
          <input placeholder="Mô tả tóm tắt cho công cụ tìm kiếm" value={catSeoDesc} onChange={(e) => setCatSeoDesc(e.target.value)} />
        </label>
        <button type="submit">{catId ? 'Cập nhật danh mục' : 'Lưu danh mục'}</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Đường dẫn (Slug)</th>
              <th>Tiêu đề SEO</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.slug}</td>
                <td>{item.seoTitle || ''}</td>
                <td className="row-actions">
                  <button type="button" onClick={() => handleEdit(item)}>Sửa</button>
                  <button type="button" className="danger" onClick={() => handleDelete(item.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
