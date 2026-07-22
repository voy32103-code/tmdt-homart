const prisma = require('../config/prisma');

class ProductRepository {
  async findAll({ categoryId, search, page, limit } = {}) {
    const where = {};
    if (categoryId) where.categoryId = Number(categoryId);
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    const queryOptions = {
      where,
      include: {
        category: true,
        prices: { orderBy: { effectiveFrom: 'desc' } },
        promotions: { orderBy: { startDate: 'desc' } },
        comments: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { id: 'asc' }
    };

    if (page && limit) {
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * limitNum;

      const [items, total] = await Promise.all([
        prisma.product.findMany({ ...queryOptions, skip, take: limitNum }),
        prisma.product.count({ where })
      ]);

      return { items, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
    }

    const items = await prisma.product.findMany(queryOptions);
    return { items, total: items.length, page: 1, limit: items.length, totalPages: 1 };
  }

  async findById(id) {
    return prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        prices: { orderBy: { effectiveFrom: 'desc' } },
        promotions: { orderBy: { startDate: 'desc' } },
        comments: { orderBy: { createdAt: 'desc' } }
      }
    });
  }

  async findBySku(sku) {
    return prisma.product.findUnique({ where: { sku } });
  }

  async findBySlug(slug) {
    return prisma.product.findUnique({ where: { slug } });
  }

  async create(data) {
    return prisma.product.create({ data });
  }

  async update(id, data) {
    return prisma.product.update({
      where: { id: Number(id) },
      data
    });
  }

  async delete(id) {
    return prisma.product.delete({ where: { id: Number(id) } });
  }

  async createPriceHistory(data) {
    return prisma.productPrice.create({
      data: {
        productId: Number(data.productId),
        price: data.price,
        effectiveFrom: data.effectiveFrom || data.startsAt || new Date()
      }
    });
  }

  async findPromotionsByProductId(productId) {
    return prisma.promotion.findMany({
      where: { productId: Number(productId) },
      orderBy: { startDate: 'desc' }
    });
  }

  async findAllPromotions() {
    return prisma.promotion.findMany({
      orderBy: { id: 'asc' }
    });
  }

  async createPromotion(data) {
    return prisma.promotion.create({ data });
  }

  async updatePromotion(id, data) {
    return prisma.promotion.update({
      where: { id: Number(id) },
      data
    });
  }

  async deletePromotion(id) {
    return prisma.promotion.delete({ where: { id: Number(id) } });
  }

  async countActivePromotions(now = new Date()) {
    return prisma.promotion.count({
      where: {
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });
  }

  async countTotalProducts() {
    return prisma.product.count();
  }
}

module.exports = new ProductRepository();
