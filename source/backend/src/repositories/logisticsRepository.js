const prisma = require('../config/prisma');

class LogisticsRepository {
  async findAllCompanies({ status } = {}) {
    const where = {};
    if (status) where.status = status;
    return prisma.logisticsCompany.findMany({
      where,
      orderBy: { id: 'asc' }
    });
  }

  async findCompanyById(id) {
    return prisma.logisticsCompany.findUnique({ where: { id: Number(id) } });
  }

  async findCompanyBySlug(slug) {
    return null;
  }

  async createCompany(data) {
    return prisma.logisticsCompany.create({ data });
  }

  async updateCompany(id, data) {
    return prisma.logisticsCompany.update({
      where: { id: Number(id) },
      data
    });
  }

  async deleteCompany(id) {
    return prisma.logisticsCompany.delete({ where: { id: Number(id) } });
  }

  async findAllPartners({ storeId } = {}) {
    const where = {};
    if (storeId) where.storeId = Number(storeId);
    return prisma.storeLogisticsPartner.findMany({
      where,
      include: {
        store: true,
        logisticsCompany: true
      },
      orderBy: { id: 'asc' }
    });
  }

  async findPartnerById(id) {
    return prisma.storeLogisticsPartner.findUnique({
      where: { id: Number(id) },
      include: {
        store: true,
        logisticsCompany: true
      }
    });
  }

  async createPartner(data) {
    return prisma.storeLogisticsPartner.create({ data });
  }

  async updatePartner(id, data) {
    return prisma.storeLogisticsPartner.update({
      where: { id: Number(id) },
      data
    });
  }

  async deletePartner(id) {
    return prisma.storeLogisticsPartner.delete({ where: { id: Number(id) } });
  }

  async countTotalCompanies() {
    return prisma.logisticsCompany.count({ where: { status: 'active' } });
  }
}

module.exports = new LogisticsRepository();
