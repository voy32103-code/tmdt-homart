const express = require('express');
const router = express.Router();

const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const logisticsController = require('../controllers/logisticsController');
const promotionController = require('../controllers/promotionController');
const orderController = require('../controllers/orderController');
const reportController = require('../controllers/reportController');
const chatbotController = require('../controllers/chatbotController');

// Auth routes
router.post('/auth/login', validate('login'), authController.login);
router.post('/auth/logout', authController.logout);

// Summary route
router.get('/summary', productController.getSummary);

// Category routes
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', requireAdmin, validate('category'), categoryController.createCategory);
router.put('/categories/:id', requireAdmin, categoryController.updateCategory);
router.delete('/categories/:id', requireAdmin, categoryController.deleteCategory);

// Product routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', requireAdmin, validate('product'), productController.createProduct);
router.put('/products/:id', requireAdmin, productController.updateProduct);
router.delete('/products/:id', requireAdmin, productController.deleteProduct);
router.post('/prices', requireAdmin, validate('productPrice'), productController.addPriceHistory);

// Comment routes
router.get('/products/:id/comments', productController.getProductComments);
router.post('/products/:id/comments', validate('comment'), productController.addComment);

// Promotion routes
router.get('/promotions', promotionController.getAllPromotions);
router.post('/promotions', requireAdmin, validate('promotion'), promotionController.createPromotion);
router.put('/promotions/:id', requireAdmin, promotionController.updatePromotion);
router.delete('/promotions/:id', requireAdmin, promotionController.deletePromotion);

// Order routes (Client & Admin)
router.post('/orders', validate('order'), orderController.createOrder);
router.get('/orders/code/:code', orderController.getOrderByCode);
router.get('/orders/phone/:phone', orderController.getOrdersByPhone);

router.get('/admin/orders', requireAdmin, orderController.getAllOrders);
router.put('/admin/orders/:id', requireAdmin, orderController.updateOrderStatus);

// Logistics routes (Client & Admin)
router.get('/logistics-companies', logisticsController.getAllCompanies);
router.get('/admin/logistics-companies', requireAdmin, logisticsController.getAllCompanies);
router.post('/admin/logistics-companies', requireAdmin, validate('logisticsCompany'), logisticsController.createCompany);
router.put('/admin/logistics-companies/:id', requireAdmin, logisticsController.updateCompany);
router.delete('/admin/logistics-companies/:id', requireAdmin, logisticsController.deleteCompany);

router.get('/admin/store-logistics-partners', requireAdmin, logisticsController.getAllPartners);
router.post('/admin/store-logistics-partners', requireAdmin, validate('storeLogisticsPartner'), logisticsController.createPartner);
router.put('/admin/store-logistics-partners/:id', requireAdmin, logisticsController.updatePartner);
router.delete('/admin/store-logistics-partners/:id', requireAdmin, logisticsController.deletePartner);

// Comment Moderation routes (Admin)
router.get('/admin/comments', requireAdmin, productController.getAllCommentsAdmin);
router.delete('/admin/comments/:id', requireAdmin, productController.deleteComment);

// Chatbot route
router.post('/chatbot', chatbotController.handleChatbot);

// Admin Report routes
router.get('/admin/reports/overview', requireAdmin, reportController.getOverview);
router.get('/admin/reports/revenue-by-date', requireAdmin, reportController.getRevenueByDate);
router.get('/admin/reports/top-products', requireAdmin, reportController.getTopProducts);
router.get('/admin/reports/revenue-by-category', requireAdmin, reportController.getRevenueByCategory);
router.get('/admin/reports/order-status-summary', requireAdmin, reportController.getOrderStatusSummary);

module.exports = router;
