const prisma = require('../config/prisma');

class CategoryRepository {
  async findAll({ status = 'active' } = {}) {
    const where = {};
    if (status) where.status = status;
    return prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { id: 'asc' }
      ]
    });
  }

  async findById(id) {
    return prisma.category.findUnique({ where: { id: Number(id) } });
  }

  async findBySlug(slug) {
    return prisma.category.findUnique({ where: { slug } });
  }

  async create(data) {
    return prisma.category.create({ data });
  }

  async update(id, data) {
    return prisma.category.update({
      where: { id: Number(id) },
      data
    });
  }

  async delete(id) {
    return prisma.category.delete({ where: { id: Number(id) } });
  }

  async countProductsInCategory(categoryId) {
    return prisma.product.count({
      where: { categoryId: Number(categoryId) }
    });
  }

  async countTotalCategories() {
    return prisma.category.count({ where: { status: 'active' } });
  }
}

module.exports = new CategoryRepository();
