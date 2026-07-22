const prisma = require('../config/prisma');

class OrderRepository {
  async findAll({ status, search, page, limit } = {}) {
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { orderCode: { contains: search, mode: 'insensitive' } },
        { customer: { fullName: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const queryOptions = {
      where,
      include: {
        customer: true,
        logisticsCompany: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    };

    if (page && limit) {
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * limitNum;

      const [items, total] = await Promise.all([
        prisma.order.findMany({ ...queryOptions, skip, take: limitNum }),
        prisma.order.count({ where })
      ]);

      return { items, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
    }

    const items = await prisma.order.findMany(queryOptions);
    return { items, total: items.length, page: 1, limit: items.length, totalPages: 1 };
  }

  async findById(id) {
    return prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        logisticsCompany: true,
        items: { include: { product: true } }
      }
    });
  }

  async findByCode(orderCode) {
    return prisma.order.findUnique({
      where: { orderCode },
      include: {
        customer: true,
        logisticsCompany: true,
        items: { include: { product: true } }
      }
    });
  }

  async findByCustomerPhone(phone) {
    return prisma.order.findMany({
      where: { customer: { phone } },
      include: {
        customer: true,
        logisticsCompany: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id, status) {
    return prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });
  }

  async findOrCreateCustomer({ fullName, phone, email, address }) {
    let customer = await prisma.customer.findFirst({ where: { phone } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName,
          phone,
          email: email || null,
          address: address || null
        }
      });
    } else if (address || fullName || email) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          fullName: fullName || customer.fullName,
          email: email !== undefined ? email : customer.email,
          address: address || customer.address
        }
      });
    }
    return customer;
  }
}

module.exports = new OrderRepository();
