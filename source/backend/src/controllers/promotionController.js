const promotionService = require('../services/promotionService');

exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await promotionService.getAllPromotions();
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const promotion = await promotionService.createPromotion(data);
    res.status(201).json(promotion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const updated = await promotionService.updatePromotion(req.params.id, data);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const result = await promotionService.deletePromotion(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
