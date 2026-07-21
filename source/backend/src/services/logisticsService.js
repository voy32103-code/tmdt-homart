const logisticsRepo = require('../repositories/logisticsRepository');

class LogisticsService {
  async getAllCompanies(filters) {
    const companies = await logisticsRepo.findAllCompanies(filters);
    return companies.map(c => ({
      id: c.id,
      name: c.name,
      slug: `log-${c.id}`,
      phone: '',
      baseFee: Number(c.baseFee),
      area: c.area || '',
      rating: 5,
      status: c.status,
      createdAt: c.createdAt
    }));
  }

  async getCompanyById(id) {
    const company = await logisticsRepo.findCompanyById(id);
    if (!company) throw new Error('Không tìm thấy công ty giao nhận');
    return {
      id: company.id,
      name: company.name,
      slug: `log-${company.id}`,
      phone: '',
      baseFee: Number(company.baseFee),
      area: company.area || '',
      rating: 5,
      status: company.status,
      createdAt: company.createdAt
    };
  }

  async createCompany(data) {
    const created = await logisticsRepo.createCompany({
      name: data.name,
      baseFee: Number(data.baseFee || 0),
      area: data.area || data.serviceArea || null,
      status: data.status || 'active'
    });

    return this.getCompanyById(created.id);
  }

  async updateCompany(id, data) {
    const company = await logisticsRepo.findCompanyById(id);
    if (!company) throw new Error('Không tìm thấy công ty giao nhận để cập nhật');

    await logisticsRepo.updateCompany(id, {
      name: data.name !== undefined ? data.name : company.name,
      baseFee: data.baseFee !== undefined ? Number(data.baseFee) : company.baseFee,
      area: data.area !== undefined ? data.area : (data.serviceArea !== undefined ? data.serviceArea : company.area),
      status: data.status !== undefined ? data.status : company.status
    });

    return this.getCompanyById(id);
  }

  async deleteCompany(id) {
    await this.getCompanyById(id);
    await logisticsRepo.deleteCompany(id);
    return { success: true, message: 'Đã xóa công ty giao nhận' };
  }

  async getAllPartners(filters) {
    const partners = await logisticsRepo.findAllPartners(filters);
    return partners.map(p => ({
      id: p.id,
      storeId: p.storeId,
      logisticsCompanyId: p.logisticsCompanyId,
      logisticsName: p.logisticsCompany ? p.logisticsCompany.name : '',
      customFee: p.customFee ? Number(p.customFee) : 0,
      baseFee: p.customFee ? Number(p.customFee) : (p.logisticsCompany ? Number(p.logisticsCompany.baseFee) : 0),
      feePerKm: 0,
      serviceArea: p.logisticsCompany ? p.logisticsCompany.area : '',
      rating: 5,
      status: p.status,
      createdAt: p.createdAt
    }));
  }

  async createPartner(data) {
    const created = await logisticsRepo.createPartner({
      storeId: Number(data.storeId || 1),
      logisticsCompanyId: Number(data.logisticsCompanyId),
      customFee: Number(data.customFee || data.baseFee || 0),
      status: data.status || 'active'
    });
    const partner = await logisticsRepo.findPartnerById(created.id);
    return {
      id: partner.id,
      storeId: partner.storeId,
      logisticsCompanyId: partner.logisticsCompanyId,
      logisticsName: partner.logisticsCompany ? partner.logisticsCompany.name : '',
      customFee: partner.customFee ? Number(partner.customFee) : 0,
      baseFee: partner.customFee ? Number(partner.customFee) : (partner.logisticsCompany ? Number(partner.logisticsCompany.baseFee) : 0),
      feePerKm: 0,
      serviceArea: partner.logisticsCompany ? partner.logisticsCompany.area : '',
      rating: 5,
      status: partner.status,
      createdAt: partner.createdAt
    };
  }

  async updatePartner(id, data) {
    const partner = await logisticsRepo.findPartnerById(id);
    if (!partner) throw new Error('Không tìm thấy liên kết đối tác');

    await logisticsRepo.updatePartner(id, {
      storeId: data.storeId ? Number(data.storeId) : partner.storeId,
      logisticsCompanyId: data.logisticsCompanyId ? Number(data.logisticsCompanyId) : partner.logisticsCompanyId,
      customFee: data.customFee !== undefined ? Number(data.customFee) : (data.baseFee !== undefined ? Number(data.baseFee) : partner.customFee),
      status: data.status !== undefined ? data.status : partner.status
    });

    const updated = await logisticsRepo.findPartnerById(id);
    return {
      id: updated.id,
      storeId: updated.storeId,
      logisticsCompanyId: updated.logisticsCompanyId,
      logisticsName: updated.logisticsCompany ? updated.logisticsCompany.name : '',
      customFee: updated.customFee ? Number(updated.customFee) : 0,
      baseFee: updated.customFee ? Number(updated.customFee) : (updated.logisticsCompany ? Number(updated.logisticsCompany.baseFee) : 0),
      feePerKm: 0,
      serviceArea: updated.logisticsCompany ? updated.logisticsCompany.area : '',
      rating: 5,
      status: updated.status,
      createdAt: updated.createdAt
    };
  }

  async deletePartner(id) {
    const partner = await logisticsRepo.findPartnerById(id);
    if (!partner) throw new Error('Không tìm thấy liên kết đối tác để xóa');
    await logisticsRepo.deletePartner(id);
    return { success: true, message: 'Đã xóa liên kết đối tác' };
  }
}

module.exports = new LogisticsService();
