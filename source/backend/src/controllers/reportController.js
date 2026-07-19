const prisma = require('../config/prisma');

async function getSummary(req, res) {
  try {
    const productsCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    const activePromotionsCount = await prisma.promotion.count({
      where: {
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      }
    });
    const logisticsCompaniesCount = await prisma.logisticsCompany.count();

    return res.json({
      products: productsCount,
      categories: categoriesCount,
      activePromotions: activePromotionsCount,
      logisticsCompanies: logisticsCompaniesCount
    });
  } catch (error) {
    console.error('Lỗi lấy tổng quan hệ thống:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function getOverviewReport(req, res) {
  const { from, to } = req.query;
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  try {
    const whereClause = {};
    if (fromDate || toDate) {
      whereClause.createdAt = {};
      if (fromDate) whereClause.createdAt.gte = fromDate;
      if (toDate) {
        const nextDay = new Date(toDate);
        nextDay.setDate(nextDay.getDate() + 1);
        whereClause.createdAt.lt = nextDay;
      }
    }

    const allOrders = await prisma.order.findMany({
      where: whereClause
    });

    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter(o => o.status === 'completed').length;
    const cancelledOrders = allOrders.filter(o => o.status === 'cancelled').length;
    
    // Revenue counts non-cancelled orders
    const totalRevenue = allOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.grandTotal), 0);

    return res.json({
      totalRevenue,
      totalOrders,
      completedOrders,
      cancelledOrders
    });
  } catch (error) {
    console.error('Lỗi lấy báo cáo overview:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function getRevenueByDateReport(req, res) {
  const { from, to } = req.query;
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  try {
    const whereClause = { status: { not: 'cancelled' } };
    if (fromDate || toDate) {
      whereClause.createdAt = {};
      if (fromDate) whereClause.createdAt.gte = fromDate;
      if (toDate) {
        const nextDay = new Date(toDate);
        nextDay.setDate(nextDay.getDate() + 1);
        whereClause.createdAt.lt = nextDay;
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    });

    // Group by date in JS
    const grouped = {};
    for (const o of orders) {
      const dateStr = o.createdAt.toISOString().slice(0, 10);
      if (!grouped[dateStr]) {
        grouped[dateStr] = { date: dateStr, totalRevenue: 0, orderCount: 0 };
      }
      grouped[dateStr].totalRevenue += Number(o.grandTotal);
      grouped[dateStr].orderCount += 1;
    }

    return res.json(Object.values(grouped));
  } catch (error) {
    console.error('Lỗi lấy báo cáo doanh thu theo ngày:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function getTopProductsReport(req, res) {
  const { from, to } = req.query;
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  try {
    const whereClause = { order: { status: { not: 'cancelled' } } };
    if (fromDate || toDate) {
      whereClause.order.createdAt = {};
      if (fromDate) whereClause.order.createdAt.gte = fromDate;
      if (toDate) {
        const nextDay = new Date(toDate);
        nextDay.setDate(nextDay.getDate() + 1);
        whereClause.order.createdAt.lt = nextDay;
      }
    }

    const orderItems = await prisma.orderItem.findMany({
      where: whereClause,
      include: { product: true }
    });

    const productsMap = {};
    for (const item of orderItems) {
      if (!item.product) continue;
      const pid = item.productId;
      if (!productsMap[pid]) {
        productsMap[pid] = {
          id: pid,
          name: item.product.name,
          sku: item.product.sku,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      productsMap[pid].totalQuantity += item.quantity;
      productsMap[pid].totalRevenue += Number(item.lineTotal);
    }

    const sorted = Object.values(productsMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    return res.json(sorted);
  } catch (error) {
    console.error('Lỗi lấy báo cáo top sản phẩm:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function getRevenueByCategoryReport(req, res) {
  const { from, to } = req.query;
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  try {
    const whereClause = { order: { status: { not: 'cancelled' } } };
    if (fromDate || toDate) {
      whereClause.order.createdAt = {};
      if (fromDate) whereClause.order.createdAt.gte = fromDate;
      if (toDate) {
        const nextDay = new Date(toDate);
        nextDay.setDate(nextDay.getDate() + 1);
        whereClause.order.createdAt.lt = nextDay;
      }
    }

    const orderItems = await prisma.orderItem.findMany({
      where: whereClause,
      include: {
        product: {
          include: { category: true }
        }
      }
    });

    const categoryMap = {};
    for (const item of orderItems) {
      const cat = item.product?.category;
      if (!cat) continue;
      if (!categoryMap[cat.id]) {
        categoryMap[cat.id] = {
          categoryName: cat.name,
          totalRevenue: 0,
          totalQuantity: 0
        };
      }
      categoryMap[cat.id].totalQuantity += item.quantity;
      categoryMap[cat.id].totalRevenue += Number(item.lineTotal);
    }

    const sorted = Object.values(categoryMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return res.json(sorted);
  } catch (error) {
    console.error('Lỗi lấy báo cáo doanh thu theo danh mục:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function getOrderStatusSummaryReport(req, res) {
  const { from, to } = req.query;
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  try {
    const whereClause = {};
    if (fromDate || toDate) {
      whereClause.createdAt = {};
      if (fromDate) whereClause.createdAt.gte = fromDate;
      if (toDate) {
        const nextDay = new Date(toDate);
        nextDay.setDate(nextDay.getDate() + 1);
        whereClause.createdAt.lt = nextDay;
      }
    }

    const grouped = await prisma.order.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    const mapped = grouped.map(g => ({
      status: g.status,
      count: g._count.id
    }));

    return res.json(mapped);
  } catch (error) {
    console.error('Lỗi lấy báo cáo thống kê trạng thái:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

// Admin comment moderation
async function getAdminComments(req, res) {
  try {
    const comments = await prisma.comment.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = comments.map(c => ({
      id: c.id,
      customerName: c.customerName,
      content: c.content,
      rating: c.rating,
      createdAt: c.createdAt,
      productName: c.product?.name || ''
    }));

    return res.json(mapped);
  } catch (error) {
    console.error('Lỗi lấy danh sách bình luận admin:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function deleteAdminComment(req, res) {
  const { id } = req.params;
  try {
    await prisma.comment.delete({
      where: { id: Number(id) }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi xóa bình luận:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

module.exports = {
  getSummary,
  getOverviewReport,
  getRevenueByDateReport,
  getTopProductsReport,
  getRevenueByCategoryReport,
  getOrderStatusSummaryReport,
  getAdminComments,
  deleteAdminComment
};
