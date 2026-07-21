const logisticsRepo = require('../repositories/logisticsRepository');

class LogisticsService {
  async getAllCompanies(filters) {
    return logisticsRepo.findAllCompanies(filters);
  }

  async getCompanyById(id) {
    const company = await logisticsRepo.findCompanyById(id);
    if (!company) throw new Error('Không tìm thấy công ty giao nhận');
    return company;
  }

  async createCompany(data) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await logisticsRepo.findCompanyBySlug(slug);
    if (existing) throw new Error('Mã định danh (Slug) đơn vị giao nhận đã tồn tại');

    return logisticsRepo.createCompany({
      name: data.name,
      slug: slug || `log-${Date.now()}`,
      phone: data.phone || null,
      baseFee: Number(data.baseFee || 0),
      rating: Number(data.rating || 5),
      status: data.status || 'active'
    });
  }

  async updateCompany(id, data) {
    const company = await logisticsRepo.findCompanyById(id);
    if (!company) throw new Error('Không tìm thấy công ty giao nhận để cập nhật');

    return logisticsRepo.updateCompany(id, {
      name: data.name !== undefined ? data.name : company.name,
      slug: data.slug !== undefined ? data.slug : company.slug,
      phone: data.phone !== undefined ? data.phone : company.phone,
      baseFee: data.baseFee !== undefined ? Number(data.baseFee) : company.baseFee,
      rating: data.rating !== undefined ? Number(data.rating) : company.rating,
      status: data.status !== undefined ? data.status : company.status
    });
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
      baseFee: Number(p.baseFee),
      feePerKm: Number(p.feePerKm),
      serviceArea: p.serviceArea || '',
      rating: Number(p.rating),
      status: p.status,
      createdAt: p.createdAt
    }));
  }

  async createPartner(data) {
    return logisticsRepo.createPartner({
      storeId: Number(data.storeId || 1),
      logisticsCompanyId: Number(data.logisticsCompanyId),
      baseFee: Number(data.baseFee || 0),
      feePerKm: Number(data.feePerKm || 0),
      serviceArea: data.serviceArea || null,
      rating: Number(data.rating || 5),
      status: data.status || 'active'
    });
  }

  async updatePartner(id, data) {
    const partner = await logisticsRepo.findPartnerById(id);
    if (!partner) throw new Error('Không tìm thấy liên kết đối tác');

    return logisticsRepo.updatePartner(id, {
      storeId: data.storeId ? Number(data.storeId) : partner.storeId,
      logisticsCompanyId: data.logisticsCompanyId ? Number(data.logisticsCompanyId) : partner.logisticsCompanyId,
      baseFee: data.baseFee !== undefined ? Number(data.baseFee) : partner.baseFee,
      feePerKm: data.feePerKm !== undefined ? Number(data.feePerKm) : partner.feePerKm,
      serviceArea: data.serviceArea !== undefined ? data.serviceArea : partner.serviceArea,
      rating: data.rating !== undefined ? Number(data.rating) : partner.rating,
      status: data.status !== undefined ? data.status : partner.status
    });
  }

  async deletePartner(id) {
    const partner = await logisticsRepo.findPartnerById(id);
    if (!partner) throw new Error('Không tìm thấy liên kết đối tác để xóa');
    await logisticsRepo.deletePartner(id);
    return { success: true, message: 'Đã xóa liên kết đối tác' };
  }
}

module.exports = new LogisticsService();
