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
        <h2>🏷️ Giá sản phẩm & Khuyến mại</h2>
      </div>

      <div className="admin-forms-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Update Price Form */}
        <div className="form-card">
          <h3 className="form-card-title">💰 Cập nhật giá bán</h3>
          <form onSubmit={handleAddPrice} className="stack-form">
            <div className="form-group">
              <label>Chọn sản phẩm</label>
              <select value={priceProdId} onChange={(e) => setPriceProdId(e.target.value)}>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Giá mới (VNĐ)</label>
              <input required type="number" placeholder="Ví dụ: 1290000" value={priceVal} onChange={(e) => setPriceVal(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Ghi chú lý do thay đổi</label>
              <input placeholder="Ví dụ: Điều chỉnh giá nhập nguyên liệu" value={priceNote} onChange={(e) => setPriceNote(e.target.value)} />
            </div>

            <button type="submit" className="btn-admin-submit">
              Cập nhật giá mới
            </button>
          </form>
        </div>

        {/* Create Promotion Form */}
        <div className="form-card">
          <h3 className="form-card-title">🔥 Tạo chương trình khuyến mại</h3>
          <form onSubmit={handleAddPromotion} className="stack-form">
            <div className="form-row-2">
              <div className="form-group">
                <label>Sản phẩm áp dụng</label>
                <select value={promoProdId} onChange={(e) => setPromoProdId(e.target.value)}>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tên chương trình</label>
                <input required placeholder="VD: Khuyến mại Hè Rực Rỡ" value={promoName} onChange={(e) => setPromoName(e.target.value)} />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Loại giảm giá</label>
                <select value={promoType} onChange={(e) => setPromoType(e.target.value)}>
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (VNĐ)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Giá trị giảm</label>
                <input required type="number" placeholder="VD: 10" value={promoVal} onChange={(e) => setPromoVal(e.target.value)} />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Ngày bắt đầu</label>
                <input required type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc</label>
                <input required type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-admin-submit">
              Lưu chương trình KM
            </button>
          </form>
        </div>
      </div>

      <div className="section-title">
        <h3>Danh sách khuyến mại đang có</h3>
      </div>
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
                <td><strong>#{item.id}</strong></td>
                <td><strong>{item.name}</strong></td>
                <td>{item.discountType === 'percent' ? 'Phần trăm (%)' : 'Cố định (VNĐ)'}</td>
                <td><strong>{item.discountValue} {item.discountType === 'percent' ? '%' : '₫'}</strong></td>
                <td>{new Date(item.startsAt).toLocaleString('vi-VN')}</td>
                <td>{new Date(item.endsAt).toLocaleString('vi-VN')}</td>
                <td>
                  <span className={`status-badge status-${item.status}`}>
                    {item.status === 'active' ? '● Đang diễn ra' : item.status}
                  </span>
                </td>
                <td className="row-actions">
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
