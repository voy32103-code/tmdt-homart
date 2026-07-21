const productService = require('../services/productService');
const commentService = require('../services/commentService');
const categoryRepo = require('../repositories/categoryRepository');
const productRepo = require('../repositories/productRepository');
const logisticsRepo = require('../repositories/logisticsRepository');

exports.getSummary = async (req, res) => {
  try {
    const [products, categories, activePromotions, logisticsCompanies] = await Promise.all([
      productRepo.countTotalProducts(),
      categoryRepo.countTotalCategories(),
      productRepo.countActivePromotions(),
      logisticsRepo.countTotalCompanies()
    ]);
    res.json({ products, categories, activePromotions, logisticsCompanies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const newProduct = await productService.createProduct(data);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const updated = await productService.updateProduct(req.params.id, data);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.addPriceHistory = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const result = await productService.addPriceHistory(data);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getProductComments = async (req, res) => {
  try {
    const comments = await commentService.getCommentsByProductId(req.params.id);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const data = req.validatedBody || req.body;
    const comment = await commentService.addComment(req.params.id, data);
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllCommentsAdmin = async (req, res) => {
  try {
    const comments = await commentService.getAllComments();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const result = await commentService.deleteComment(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
