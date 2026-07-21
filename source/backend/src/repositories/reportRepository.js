const prisma = require('../config/prisma');

class ReportRepository {
  async getOverview({ fromDate, toDate } = {}) {
    const where = {};
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const [totalOrders, completedOrders, cancelledOrders, revenueAggregate] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'completed' } }),
      prisma.order.count({ where: { ...where, status: 'cancelled' } }),
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { ...where, status: { not: 'cancelled' } }
      })
    ]);

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: Number(revenueAggregate._sum.grandTotal || 0)
    };
  }

  async getRevenueByDate({ fromDate, toDate } = {}) {
    const where = { status: { not: 'cancelled' } };
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      select: { createdAt: true, grandTotal: true },
      orderBy: { createdAt: 'asc' }
    });

    const revenueMap = {};
    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      revenueMap[dateStr] = (revenueMap[dateStr] || 0) + Number(order.grandTotal);
    });

    return Object.keys(revenueMap).map(date => ({
      date,
      totalRevenue: revenueMap[date]
    }));
  }

  async getTopProducts({ fromDate, toDate, limit = 10 } = {}) {
    const where = { order: { status: { not: 'cancelled' } } };
    if (fromDate || toDate) {
      where.order.createdAt = {};
      if (fromDate) where.order.createdAt.gte = new Date(fromDate);
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        where.order.createdAt.lte = to;
      }
    }

    const items = await prisma.orderItem.findMany({
      where,
      include: { product: true }
    });

    const prodMap = {};
    items.forEach(item => {
      const pid = item.productId;
      if (!prodMap[pid]) {
        prodMap[pid] = {
          productId: pid,
          name: item.product ? item.product.name : `Sản phẩm #${pid}`,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      prodMap[pid].totalQuantity += item.quantity;
      prodMap[pid].totalRevenue += Number(item.lineTotal);
    });

    return Object.values(prodMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }

  async getRevenueByCategory({ fromDate, toDate } = {}) {
    const where = { order: { status: { not: 'cancelled' } } };
    if (fromDate || toDate) {
      where.order.createdAt = {};
      if (fromDate) where.order.createdAt.gte = new Date(fromDate);
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        where.order.createdAt.lte = to;
      }
    }

    const items = await prisma.orderItem.findMany({
      where,
      include: { product: { include: { category: true } } }
    });

    const catMap = {};
    items.forEach(item => {
      const catName = item.product && item.product.category ? item.product.category.name : 'Khác';
      catMap[catName] = (catMap[catName] || 0) + Number(item.lineTotal);
    });

    return Object.keys(catMap).map(categoryName => ({
      categoryName,
      totalRevenue: catMap[categoryName]
    }));
  }

  async getOrderStatusSummary({ fromDate, toDate } = {}) {
    const where = {};
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    });

    return statusCounts.map(item => ({
      status: item.status,
      count: item._count.status
    }));
  }
}

module.exports = new ReportRepository();
