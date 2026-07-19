const express = require('express');
const router = express.Router();

const { authenticateToken, requireAdmin } = require('../middleware/auth');
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const logisticsController = require('../controllers/logisticsController');
const promotionController = require('../controllers/promotionController');
const orderController = require('../controllers/orderController');
const reportController = require('../controllers/reportController');
const chatbotController = require('../controllers/chatbotController');

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// Category routes
router.get('/categories', categoryController.getCategories);
router.post('/categories', requireAdmin, categoryController.createCategory);
router.put('/categories/:id', requireAdmin, categoryController.updateCategory);
router.delete('/categories/:id', requireAdmin, categoryController.deleteCategory);

// Product routes
router.get('/products', productController.listProducts);
router.get('/products/:id', productController.getProduct);
router.post('/products', requireAdmin, productController.createProduct);
router.put('/products/:id', requireAdmin, productController.updateProduct);
router.delete('/products/:id', requireAdmin, productController.deleteProduct);

// Comment routes
router.get('/products/:id/comments', productController.getComments);
router.post('/products/:id/comments', productController.createComment);

// Logistics routes
router.get('/logistics-companies', logisticsController.listLogisticsCompanies);

// Promotion routes
router.get('/promotions', promotionController.listPromotions);
router.post('/promotions', requireAdmin, promotionController.createPromotion);
router.put('/promotions/:id', requireAdmin, promotionController.updatePromotion);
router.delete('/promotions/:id', requireAdmin, promotionController.deletePromotion);

// Order routes
router.post('/orders', orderController.createOrder);
router.post('/orders/:id/cancel', orderController.cancelOrder);
router.get('/orders/history', authenticateToken, orderController.getOrderHistory);

// Chatbot route
router.post('/chatbot', chatbotController.handleChatbot);

// Summary route
router.get('/summary', reportController.getSummary);

// Admin specific routes
router.get('/admin/orders', requireAdmin, orderController.listOrders);
router.put('/admin/orders/:id', requireAdmin, orderController.updateOrderStatus);

router.get('/admin/logistics-companies', requireAdmin, logisticsController.adminListLogisticsCompanies);
router.post('/admin/logistics-companies', requireAdmin, logisticsController.createLogisticsCompany);
router.put('/admin/logistics-companies/:id', requireAdmin, logisticsController.updateLogisticsCompany);
router.delete('/admin/logistics-companies/:id', requireAdmin, logisticsController.deleteLogisticsCompany);

router.get('/admin/store-logistics-partners', requireAdmin, logisticsController.listPartners);
router.post('/admin/store-logistics-partners', requireAdmin, logisticsController.createPartner);
router.put('/admin/store-logistics-partners/:id', requireAdmin, logisticsController.updatePartner);
router.delete('/admin/store-logistics-partners/:id', requireAdmin, logisticsController.deletePartner);

router.get('/admin/comments', requireAdmin, reportController.getAdminComments);
router.delete('/admin/comments/:id', requireAdmin, reportController.deleteAdminComment);

// Report routes
router.get('/admin/reports/overview', requireAdmin, reportController.getOverviewReport);
router.get('/admin/reports/revenue-by-date', requireAdmin, reportController.getRevenueByDateReport);
router.get('/admin/reports/top-products', requireAdmin, reportController.getTopProductsReport);
router.get('/admin/reports/revenue-by-category', requireAdmin, reportController.getRevenueByCategoryReport);
router.get('/admin/reports/order-status-summary', requireAdmin, reportController.getOrderStatusSummaryReport);

module.exports = router;
