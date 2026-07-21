const prisma = require('../config/prisma');

class CommentRepository {
  async findByProductId(productId) {
    return prisma.comment.findMany({
      where: { productId: Number(productId) },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAll() {
    return prisma.comment.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data) {
    return prisma.comment.create({ data });
  }

  async delete(id) {
    return prisma.comment.delete({ where: { id: Number(id) } });
  }

  async findById(id) {
    return prisma.comment.findUnique({ where: { id: Number(id) } });
  }
}

module.exports = new CommentRepository();
