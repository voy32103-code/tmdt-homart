const orderService = require('../services/orderService');

exports.createOrder = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const order = await orderService.createOrder(data);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getOrderByCode = async (req, res) => {
  try {
    const order = await orderService.getOrderByCode(req.params.code);
    res.json(order);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.getOrdersByPhone = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByPhone(req.params.phone);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders(req.query);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Trạng thái không được để trống' });
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
