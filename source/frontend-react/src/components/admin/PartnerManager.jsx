import React, { useState, useEffect, useCallback } from 'react';
import { logisticsApi } from '../../api/logisticsApi';
import { useAuthStore } from '../../stores/authStore';

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function PartnerManager() {
  const [partners, setPartners] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [partnerId, setPartnerId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [baseFee, setBaseFee] = useState(25000);
  const [feePerKm, setFeePerKm] = useState(5000);
  const [serviceArea, setServiceArea] = useState('Toàn quốc');
  const token = useAuthStore(state => state.token);

  const loadData = useCallback(async () => {
    try {
      const [pData, cData] = await Promise.all([
        logisticsApi.getAllPartnersAdmin(token),
        logisticsApi.getAllCompaniesAdmin(token)
      ]);
      setPartners(pData);
      setCompanies(cData);
      if (cData[0]) setCompanyId(String(cData[0].id));
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        storeId: 1,
        logisticsCompanyId: Number(companyId),
        baseFee: Number(baseFee),
        feePerKm: Number(feePerKm),
        serviceArea
      };

      if (partnerId) {
        await logisticsApi.updatePartner(partnerId, payload, token);
      } else {
        await logisticsApi.createPartner(payload, token);
      }

      setPartnerId('');
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (p) => {
    setPartnerId(p.id);
    setCompanyId(String(p.logisticsCompanyId));
    setBaseFee(p.baseFee);
    setFeePerKm(p.feePerKm);
    setServiceArea(p.serviceArea || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đối tác này?')) return;
    try {
      await logisticsApi.deletePartner(id, token);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="admin-section">
      <div className="section-title">
        <h2>Đối tác liên kết Logistics</h2>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>Đơn vị giao nhận
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Cước phí thỏa thuận (VNĐ)
          <input type="number" value={baseFee} onChange={(e) => setBaseFee(Number(e.target.value))} />
        </label>
        <label>Phí mỗi KM tiếp theo (VNĐ)
          <input type="number" value={feePerKm} onChange={(e) => setFeePerKm(Number(e.target.value))} />
        </label>
        <label>Khu vực phục vụ
          <input placeholder="VD: TP. Hồ Chí Minh, Hà Nội, Toàn quốc" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} />
        </label>
        <button type="submit">{partnerId ? 'Cập nhật đối tác' : 'Lưu liên kết đối tác'}</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Đơn vị vận chuyển</th>
              <th>Cước thỏa thuận</th>
              <th>Phí/KM</th>
              <th>Khu vực phục vụ</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(p => (
              <tr key={p.id}>
                <td>{p.logisticsName}</td>
                <td>{money.format(p.baseFee)}</td>
                <td>{money.format(p.feePerKm)}</td>
                <td>{p.serviceArea}</td>
                <td>★ {p.rating}</td>
                <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
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
