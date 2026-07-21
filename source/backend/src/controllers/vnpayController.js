const vnpayService = require('../services/vnpayService');
const orderService = require('../services/orderService');

exports.createPaymentUrl = async (req, res) => {
  try {
    const { orderCode, amount, orderInfo, returnUrl } = req.body;
    if (!orderCode || !amount) {
      return res.status(400).json({ message: 'Mã đơn hàng và số tiền không được để trống' });
    }

    const paymentUrl = vnpayService.createPaymentUrl(req, {
      orderCode,
      amount,
      orderInfo,
      returnUrl
    });

    res.json({ paymentUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.handleCallback = async (req, res) => {
  try {
    const verification = vnpayService.verifyReturnUrl(req.query);

    if (verification.isSuccess && verification.orderCode) {
      try {
        // Tự động cập nhật trạng thái đơn hàng sang đã xác nhận khi thanh toán VNPAY thành công
        const existingOrder = await orderService.getOrderByCode(verification.orderCode);
        if (existingOrder && existingOrder.status === 'pending') {
          await orderService.updateOrderStatus(existingOrder.id, 'confirmed');
        }
      } catch (orderErr) {
        console.error('Không tìm thấy đơn hàng hoặc lỗi cập nhật đơn VNPAY:', orderErr);
      }
    }

    res.json({
      success: verification.isSuccess,
      data: verification
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
