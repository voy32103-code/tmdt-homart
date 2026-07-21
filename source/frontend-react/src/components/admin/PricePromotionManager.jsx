import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { promotionApi } from '../../api/promotionApi';
import { useAuthStore } from '../../stores/authStore';

export function PricePromotionManager({ products, onRefresh }) {
  const [promotions, setPromotions] = useState([]);
  const [priceProdId, setPriceProdId] = useState(products[0] ? String(products[0].id) : '');
  const [priceVal, setPriceVal] = useState('');
  const [priceNote, setPriceNote] = useState('');

  const [promoProdId, setPromoProdId] = useState(products[0] ? String(products[0].id) : '');
  const [promoName, setPromoName] = useState('');
  const [promoType, setPromoType] = useState('percent');
  const [promoVal, setPromoVal] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const token = useAuthStore(state => state.token);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const data = await promotionApi.getAll();
      setPromotions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPrice = async (e) => {
    e.preventDefault();
    try {
      await productApi.addPriceHistory({
        productId: Number(priceProdId),
        price: Number(priceVal),
        note: priceNote
      }, token);
      setPriceVal('');
      setPriceNote('');
      await onRefresh();
      alert('Đã cập nhật lịch sử giá sản phẩm');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddPromotion = async (e) => {
    e.preventDefault();
    try {
      await promotionApi.create({
        productId: Number(promoProdId),
        name: promoName,
        discountType: promoType,
        discountValue: Number(promoVal),
        startsAt,
        endsAt
      }, token);
      setPromoName('');
      setPromoVal('');
      await loadPromotions();
      await onRefresh();
      alert('Đã thêm chương trình khuyến mại');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Xóa khuyến mại này?')) return;
    try {
      await promotionApi.delete(id, token);
      await loadPromotions();
      await onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="admin-section">
      <div className="section-title">
        <h2>Giá sản phẩm & Khuyến mại</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Update Price Form */}
        <form className="card form-grid" onSubmit={handleAddPrice} style={{ gap: '12px' }}>
          <h3>Cập nhật giá bán</h3>
          <label>Chọn sản phẩm
            <select value={priceProdId} onChange={(e) => setPriceProdId(e.target.value)}>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>Giá mới (VNĐ)
            <input required type="number" value={priceVal} onChange={(e) => setPriceVal(e.target.value)} />
          </label>
          <label>Ghi chú lý do thay đổi
            <input placeholder="VD: Điều chỉnh giá nhập nguyên liệu" value={priceNote} onChange={(e) => setPriceNote(e.target.value)} />
          </label>
          <button type="submit">Cập nhật giá mới</button>
        </form>

        {/* Create Promotion Form */}
        <form className="card form-grid" onSubmit={handleAddPromotion} style={{ gap: '12px' }}>
          <h3>Tạo khuyến mại</h3>
          <label>Sản phẩm áp dụng
            <select value={promoProdId} onChange={(e) => setPromoProdId(e.target.value)}>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>Tên chương trình
            <input required placeholder="VD: Khuyến mại Hè Rực Rỡ" value={promoName} onChange={(e) => setPromoName(e.target.value)} />
          </label>
          <label>Loại giảm giá
            <select value={promoType} onChange={(e) => setPromoType(e.target.value)}>
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (VNĐ)</option>
            </select>
          </label>
          <label>Giá trị giảm
            <input required type="number" value={promoVal} onChange={(e) => setPromoVal(e.target.value)} />
          </label>
          <label>Ngày bắt đầu
            <input required type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </label>
          <label>Ngày kết thúc
            <input required type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </label>
          <button type="submit">Lưu chương trình KM</button>
        </form>
      </div>

      <h3>Danh sách khuyến mại đang có</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên chương trình</th>
              <th>Loại</th>
              <th>Mức giảm</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.discountType === 'percent' ? '%' : 'VNĐ'}</td>
                <td>{item.discountValue}</td>
                <td>{new Date(item.startsAt).toLocaleString('vi-VN')}</td>
                <td>{new Date(item.endsAt).toLocaleString('vi-VN')}</td>
                <td><span className={`status-badge status-${item.status}`}>{item.status}</span></td>
                <td>
                  <button type="button" className="danger" onClick={() => handleDeletePromo(item.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
