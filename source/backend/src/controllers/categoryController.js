const categoryService = require('../services/categoryService');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories(req.query);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const category = await categoryService.createCategory(data);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const updated = await categoryService.updateCategory(req.params.id, data);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
