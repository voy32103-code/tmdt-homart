const prisma = require('../config/prisma');
const orderRepo = require('../repositories/orderRepository');

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
    const shippingFee = Number(o.shippingFee || 0);
    const grandTotal = Number(o.grandTotal || 0);
    const subtotal = grandTotal > shippingFee ? grandTotal - shippingFee : grandTotal;

    return {
      id: o.id,
      orderCode: o.orderCode,
      status: o.status,
      customerName: o.customer ? o.customer.fullName : '',
      customerPhone: o.customer ? o.customer.phone : '',
      customerEmail: o.customer ? o.customer.email || '' : '',
      customerAddress: o.customer ? o.customer.address || '' : '',
      logisticsName: o.logisticsCompany ? o.logisticsCompany.name : '',
      subtotal,
      discountTotal: 0,
      shippingFee,
      grandTotal,
      createdAt: o.createdAt,
      items: (o.items || []).map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product ? item.product.name : '',
        quantity: item.quantity,
        unitPrice: Number(item.price || 0),
        discountAmount: 0,
        lineTotal: Number(item.lineTotal || 0)
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
      let resolvedLogisticsId = logisticsCompanyId ? Number(logisticsCompanyId) : null;

      if (resolvedLogisticsId) {
        const company = await tx.logisticsCompany.findUnique({ where: { id: resolvedLogisticsId } });
        if (company) {
          shippingFee = Number(company.baseFee);
        } else {
          resolvedLogisticsId = null;
        }
      }

      // Nếu không có company hợp lệ, lấy company đầu tiên trong DB
      if (!resolvedLogisticsId) {
        const firstCompany = await tx.logisticsCompany.findFirst({ where: { status: 'active' } });
        if (firstCompany) {
          resolvedLogisticsId = firstCompany.id;
          shippingFee = Number(firstCompany.baseFee);
        } else {
          throw new Error('Chưa có đơn vị vận chuyển nào trong hệ thống. Vui lòng liên hệ admin.');
        }
      }

      // 3. Process items & check stock
      let subtotal = 0;
      let discountTotal = 0;
      const preparedItems = [];
      const now = new Date();
      let resolvedStoreId = null;

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: Number(item.productId) },
          include: {
            prices: { orderBy: { effectiveFrom: 'desc' } },
            promotions: { orderBy: { startDate: 'desc' } }
          }
        });

        if (!product) {
          throw new Error(`Sản phẩm với ID #${item.productId} không tồn tại`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stockQuantity} mặt hàng trong kho`);
        }

        const unitPrice = Number(product.price !== undefined ? product.price : (product.prices[0] ? product.prices[0].price : 0));

        const activePromo = product.promotions.find(p => {
          const s = new Date(p.startDate);
          const e = new Date(p.endDate);
          return s <= now && e >= now;
        });

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
        const lineTotal = Math.max(0, lineSubtotal - lineDiscount);

        subtotal += lineSubtotal;
        discountTotal += lineDiscount;

        if (resolvedStoreId === null) {
          resolvedStoreId = product.storeId;
        }

        preparedItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: unitPrice,
          lineTotal
        });

        // Deduct Stock
        await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: product.stockQuantity - item.quantity }
        });
      }

      const grandTotal = Math.max(0, subtotal - discountTotal) + shippingFee;
      const orderCode = `HM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

      // 4. Create Order
      const newOrder = await tx.order.create({
        data: {
          customerId: customer.id,
          storeId: resolvedStoreId,
          logisticsCompanyId: resolvedLogisticsId,
          orderCode,
          status: 'pending',
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
