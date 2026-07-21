const reportRepo = require('../repositories/reportRepository');

class ReportService {
  async getOverview(params) {
    return reportRepo.getOverview(params);
  }

  async getRevenueByDate(params) {
    return reportRepo.getRevenueByDate(params);
  }

  async getTopProducts(params) {
    return reportRepo.getTopProducts(params);
  }

  async getRevenueByCategory(params) {
    return reportRepo.getRevenueByCategory(params);
  }

  async getOrderStatusSummary(params) {
    return reportRepo.getOrderStatusSummary(params);
  }
}

module.exports = new ReportService();
