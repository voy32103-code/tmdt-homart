const prisma = require('../config/prisma');
const orderRepo = require('../repositories/orderRepository');
const productRepo = require('../repositories/productRepository');
const logisticsRepo = require('../repositories/logisticsRepository');

class OrderService {
  async getAllOrders(filters) {
    const orders = await orderRepo.findAll(filters);
    return orders.map(o => this.formatOrder(o));
  }

  async getOrderByCode(orderCode) {
    const order = await orderRepo.findByCode(orderCode);
    if (!order) throw new Error('Không tìm thấy đơn hàng với mã chỉ định');
    return this.formatOrder(order);
  }

  async getOrdersByPhone(phone) {
    const orders = await orderRepo.findByCustomerPhone(phone);
    return orders.map(o => this.formatOrder(o));
  }

  formatOrder(o) {
    return {
      id: o.id,
      orderCode: o.orderCode,
      status: o.status,
      customerName: o.customer ? o.customer.fullName : '',
      customerPhone: o.customer ? o.customer.phone : '',
      customerEmail: o.customer ? o.customer.email || '' : '',
      customerAddress: o.customer ? o.customer.address || '' : '',
      logisticsName: o.logisticsCompany ? o.logisticsCompany.name : '',
      subtotal: Number(o.subtotal),
      discountTotal: Number(o.discountTotal),
      shippingFee: Number(o.shippingFee),
      grandTotal: Number(o.grandTotal),
      createdAt: o.createdAt,
      items: (o.items || []).map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product ? item.product.name : '',
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discountAmount: Number(item.discountAmount),
        lineTotal: Number(item.lineTotal)
      }))
    };
  }

  async createOrder({ customerName, customerPhone, customerEmail, customerAddress, logisticsCompanyId, items }) {
    if (!items || items.length === 0) {
      throw new Error('Giỏ hàng không được để trống');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Customer processing
      let customer = await tx.customer.findFirst({ where: { phone: customerPhone } });
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            fullName: customerName,
            phone: customerPhone,
            email: customerEmail || null,
            address: customerAddress || null
          }
        });
      }

      // 2. Shipping calculation
      let shippingFee = 30000;
      if (logisticsCompanyId) {
        const company = await tx.logisticsCompany.findUnique({ where: { id: Number(logisticsCompanyId) } });
        if (company) shippingFee = Number(company.baseFee);
      }

      // 3. Process items & check stock
      let subtotal = 0;
      let discountTotal = 0;
      const preparedItems = [];
      const now = new Date();

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: Number(item.productId) },
          include: {
            prices: { orderBy: { startsAt: 'desc' } },
            promotions: { orderBy: { startsAt: 'desc' } }
          }
        });

        if (!product) {
          throw new Error(`Sản phẩm với ID #${item.productId} không tồn tại`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stockQuantity} mặt hàng trong kho`);
        }

        const unitPrice = product.prices.length > 0 ? Number(product.prices[0].price) : 0;

        const activePromo = product.promotions.find(p =>
          p.status === 'active' &&
          new Date(p.startsAt) <= now &&
          new Date(p.endsAt) >= now
        );

        let discountPerUnit = 0;
        if (activePromo) {
          if (activePromo.discountType === 'percent') {
            discountPerUnit = (unitPrice * Number(activePromo.discountValue)) / 100;
          } else {
            discountPerUnit = Number(activePromo.discountValue);
          }
        }

        const lineSubtotal = unitPrice * item.quantity;
        const lineDiscount = discountPerUnit * item.quantity;
        const lineTotal = lineSubtotal - lineDiscount;

        subtotal += lineSubtotal;
        discountTotal += lineDiscount;

        preparedItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          discountAmount: discountPerUnit,
          lineTotal
        });

        // Deduct Stock
        await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: product.stockQuantity - item.quantity }
        });
      }

      const grandTotal = subtotal - discountTotal + shippingFee;
      const orderCode = `HM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

      // 4. Create Order
      const newOrder = await tx.order.create({
        data: {
          customerId: customer.id,
          storeId: 1,
          logisticsCompanyId: logisticsCompanyId ? Number(logisticsCompanyId) : 1,
          orderCode,
          status: 'pending',
          subtotal,
          discountTotal,
          shippingFee,
          grandTotal,
          items: {
            create: preparedItems
          }
        },
        include: {
          customer: true,
          logisticsCompany: true,
          items: { include: { product: true } }
        }
      });

      return this.formatOrder(newOrder);
    });
  }

  async updateOrderStatus(id, newStatus) {
    const order = await orderRepo.findById(id);
    if (!order) throw new Error('Không tìm thấy đơn hàng');

    const oldStatus = order.status;
    if (oldStatus === newStatus) return this.formatOrder(order);

    return prisma.$transaction(async (tx) => {
      // Restore stock on Cancellation
      if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } }
          });
        }
      }

      // Re-deduct stock if restored from Cancelled
      if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
        for (const item of order.items) {
          const prod = await tx.product.findUnique({ where: { id: item.productId } });
          if (prod && prod.stockQuantity < item.quantity) {
            throw new Error(`Sản phẩm "${prod.name}" không đủ tồn kho để khôi phục đơn hàng`);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } }
          });
        }
      }

      const updated = await tx.order.update({
        where: { id: Number(id) },
        data: { status: newStatus },
        include: {
          customer: true,
          logisticsCompany: true,
          items: { include: { product: true } }
        }
      });

      return this.formatOrder(updated);
    });
  }
}

module.exports = new OrderService();
