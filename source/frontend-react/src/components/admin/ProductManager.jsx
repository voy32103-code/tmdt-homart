import React, { useState } from 'react';
import { productApi } from '../../api/productApi';
import { useAuthStore } from '../../stores/authStore';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function ProductManager({ products, categories, onRefresh }) {
  const [prodId, setProdId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCatId, setProdCatId] = useState(categories[0] ? String(categories[0].id) : '');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState(0);
  const [prodBrand, setProdBrand] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodSeoTitle, setProdSeoTitle] = useState('');
  const [prodSeoDesc, setProdSeoDesc] = useState('');
  const token = useAuthStore(state => state.token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: prodName,
        sku: prodSku,
        categoryId: prodCatId ? Number(prodCatId) : (categories[0] ? categories[0].id : 1),
        price: prodPrice !== '' ? Number(prodPrice) : undefined,
        stockQuantity: Number(prodStock),
        brand: prodBrand,
        imageUrl: prodImage,
        shortDescription: prodShortDesc,
        seoTitle: prodSeoTitle,
        seoDescription: prodSeoDesc
      };

      if (prodId) {
        await productApi.update(prodId, payload, token);
      } else {
        await productApi.create(payload, token);
      }

      setProdId('');
      setProdName('');
      setProdSku('');
      setProdPrice('');
      setProdStock(0);
      setProdBrand('');
      setProdImage('');
      setProdShortDesc('');
      setProdSeoTitle('');
      setProdSeoDesc('');
      await onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (p) => {
    setProdId(p.id);
    setProdName(p.name);
    setProdSku(p.sku);
    setProdCatId(String(p.categoryId));
    setProdPrice(p.price);
    setProdStock(p.stockQuantity);
    setProdBrand(p.brand || '');
    setProdImage(p.imageUrl || '');
    setProdShortDesc(p.shortDescription || '');
    setProdSeoTitle(p.seoTitle || '');
    setProdSeoDesc(p.seoDescription || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
      await productApi.delete(id, token);
      await onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="admin-section">
      <div className="section-title">
        <h2>Sản phẩm gia dụng</h2>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>Tên sản phẩm
          <input required placeholder="Ví dụ: Nồi chiên không dầu Lock&Lock" value={prodName} onChange={(e) => setProdName(e.target.value)} />
        </label>
        <label>Mã SKU
          <input required placeholder="Ví dụ: HOM-NCKD-01" value={prodSku} onChange={(e) => setProdSku(e.target.value)} />
        </label>
        <label>Danh mục
          <select value={prodCatId} onChange={(e) => setProdCatId(e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Giá bán hiện tại (VNĐ)
          <input type="number" placeholder="1500000" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} />
        </label>
        <label>Số lượng tồn kho
          <input type="number" value={prodStock} onChange={(e) => setProdStock(Number(e.target.value))} />
        </label>
        <label>Thương hiệu
          <input placeholder="Lock&Lock, Sunhouse, Philips..." value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} />
        </label>
        <label className="wide">Đường dẫn hình ảnh (URL)
          <input placeholder="https://..." value={prodImage} onChange={(e) => setProdImage(e.target.value)} />
        </label>
        <label className="wide">Mô tả ngắn
          <input placeholder="Mô tả tóm tắt tính năng chính" value={prodShortDesc} onChange={(e) => setProdShortDesc(e.target.value)} />
        </label>
        <button type="submit">{prodId ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Mã SKU</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá hiện tại</th>
              <th>Tồn kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                </td>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.categoryName}</td>
                <td>{money.format(p.finalPrice)}</td>
                <td>
                  <span style={{ color: p.stockQuantity < 5 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                    {p.stockQuantity}
                  </span>
                </td>
                <td className="row-actions">
                  <button type="button" onClick={() => handleEdit(p)}>Sửa</button>
                  <button type="button" className="danger" onClick={() => handleDelete(p.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
