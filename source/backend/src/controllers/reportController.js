const reportService = require('../services/reportService');

exports.getOverview = async (req, res) => {
  try {
    const data = await reportService.getOverview({
      fromDate: req.query.from,
      toDate: req.query.to
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRevenueByDate = async (req, res) => {
  try {
    const data = await reportService.getRevenueByDate({
      fromDate: req.query.from,
      toDate: req.query.to
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const data = await reportService.getTopProducts({
      fromDate: req.query.from,
      toDate: req.query.to,
      limit: req.query.limit ? Number(req.query.limit) : 10
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRevenueByCategory = async (req, res) => {
  try {
    const data = await reportService.getRevenueByCategory({
      fromDate: req.query.from,
      toDate: req.query.to
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderStatusSummary = async (req, res) => {
  try {
    const data = await reportService.getOrderStatusSummary({
      fromDate: req.query.from,
      toDate: req.query.to
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
