const prisma = require('../config/prisma');
const { mapProduct } = require('./productController');

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

async function listOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        store: true,
        logisticsCompany: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = orders.map(o => ({
      id: o.id,
      orderCode: o.orderCode,
      status: o.status,
      subtotal: Number(o.shippingFee) + Number(o.grandTotal), // or whatever mapping is expected
      discountTotal: 0,
      shippingFee: Number(o.shippingFee),
      grandTotal: Number(o.grandTotal),
      createdAt: o.createdAt,
      customerName: o.customer?.fullName || '',
      customerPhone: o.customer?.phone || '',
      customerAddress: o.customer?.address || '',
      storeName: o.store?.name || '',
      logisticsName: o.logisticsCompany?.name || ''
    }));

    return res.json(mapped);
  } catch (error) {
    console.error('Lỗi lấy danh sách đơn hàng:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ['pending', 'confirmed', 'processing', 'shipping', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ.' });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    if (order.status === status) {
      return res.json({ ok: true });
    }

    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: Number(id) },
        data: { status }
      });

      // Handle stock adjustments
      if (order.status !== 'cancelled' && status === 'cancelled') {
        // Restore stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } }
          });
        }
      } else if (order.status === 'cancelled' && status !== 'cancelled') {
        // Subtract stock, check availability
        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!product || product.stockQuantity < item.quantity) {
            throw new Error(`Không đủ hàng tồn kho để phục hồi đơn hàng này.`);
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } }
          });
        }
      }
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
    return res.status(400).json({ message: error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái.' });
  }
}

async function createOrder(req, res) {
  const payload = req.body;

  if (!payload.customer || isBlank(payload.customer.fullName) || isBlank(payload.customer.phone) || isBlank(payload.customer.address)) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin khách hàng.' });
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống.' });
  }

  try {
    const logistics = await prisma.logisticsCompany.findFirst({
      where: { id: numberValue(payload.logisticsCompanyId), status: 'active' }
    });

    if (!logistics) {
      return res.status(400).json({ message: 'Đơn vị giao nhận không tồn tại trên hệ thống.' });
    }

    // Fetch product details for calculation
    const products = await prisma.product.findMany({
      include: {
        prices: true,
        promotions: true,
        comments: true
      }
    });
    const mappedProducts = products.map(mapProduct);

    const lines = [];
    for (const item of payload.items) {
      const product = mappedProducts.find((entry) => entry.id === numberValue(item.productId));
      const quantity = Number(item.quantity);

      if (!product || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Sản phẩm trong giỏ hàng không hợp lệ.' });
      }
      if (quantity > product.stockQuantity) {
        return res.status(400).json({ message: `Sản phẩm "${product.name}" hiện không đủ hàng trong kho.` });
      }

      lines.push({
        product,
        quantity,
        unitPrice: Number(product.price),
        discountAmount: Number(product.price) - Number(product.finalPrice),
        lineTotal: Number(product.finalPrice) * quantity
      });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const discountTotal = lines.reduce((sum, line) => sum + line.discountAmount * line.quantity, 0);
    const shippingFee = Number(logistics.baseFee || 0);
    const orderCode = `HM${Date.now()}`;

    // Perform transaction
    const order = await prisma.$transaction(async (tx) => {
      // Find or create customer
      let customer = await tx.customer.findUnique({
        where: { phone: payload.customer.phone }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            fullName: payload.customer.fullName,
            phone: payload.customer.phone,
            email: payload.customer.email || '',
            address: payload.customer.address
          }
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          customerId: customer.id,
          storeId: 1, // Default store id
          logisticsCompanyId: logistics.id,
          shippingFee,
          grandTotal: subtotal - discountTotal + shippingFee,
          status: 'pending'
        }
      });

      // Process items and subtract stock
      for (const line of lines) {
        const prod = await tx.product.findUnique({
          where: { id: line.product.id }
        });

        if (!prod || prod.stockQuantity < line.quantity) {
          throw new Error(`Sản phẩm "${line.product.name}" hiện không đủ hàng trong kho.`);
        }

        await tx.product.update({
          where: { id: line.product.id },
          data: { stockQuantity: { decrement: line.quantity } }
        });

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: line.product.id,
            quantity: line.quantity,
            price: line.unitPrice,
            lineTotal: line.lineTotal
          }
        });
      }

      return newOrder;
    });

    return res.status(201).json({ order: { id: order.id, orderCode: order.orderCode } });
  } catch (error) {
    console.error('Lỗi đặt hàng:', error);
    return res.status(400).json({ message: error.message || 'Đã xảy ra lỗi trong quá trình đặt hàng.' });
  }
}

async function getOrderHistory(req, res) {
  const { phone } = req.query;

  if (isBlank(phone)) {
    return res.status(400).json({ message: 'Vui lòng cung cấp số điện thoại để tra cứu lịch sử mua hàng.' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        customer: { phone }
      },
      include: {
        customer: true,
        logisticsCompany: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = orders.map(o => ({
      id: o.id,
      orderCode: o.orderCode,
      status: o.status,
      subtotal: Number(o.shippingFee) + Number(o.grandTotal), // consistent with list
      discountTotal: 0,
      shippingFee: Number(o.shippingFee),
      grandTotal: Number(o.grandTotal),
      createdAt: o.createdAt,
      customerName: o.customer?.fullName || '',
      customerPhone: o.customer?.phone || '',
      customerAddress: o.customer?.address || '',
      logisticsName: o.logisticsCompany?.name || '',
      items: o.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        discountAmount: 0,
        lineTotal: Number(item.lineTotal),
        productName: item.product?.name || '',
        productImageUrl: item.product?.imageUrl || ''
      }))
    }));

    return res.json(mapped);
  } catch (error) {
    console.error('Lỗi lấy lịch sử đơn hàng:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function cancelOrder(req, res) {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    if (order.status === 'cancelled') {
      return res.json({ ok: true, message: 'Đơn hàng đã được hủy từ trước.' });
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ message: 'Đơn hàng đang trong quá trình vận chuyển hoặc đã hoàn thành, không thể hủy.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: Number(id) },
        data: { status: 'cancelled' }
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } }
        });
      }
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Lỗi hủy đơn hàng:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi hủy đơn hàng.' });
  }
}

module.exports = {
  listOrders,
  updateOrderStatus,
  createOrder,
  getOrderHistory,
  cancelOrder
};
