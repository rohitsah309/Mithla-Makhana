import express from 'express';
const router = express.Router();
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus
} from '../controllers/orderController.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';

// Order placement supports authenticated customer or guest checkout
router.post('/', optionalAuth, createOrder);

// Customer order history
router.get('/my-orders', protect, getMyOrders);

// Tracking by order ID (public so customers can track with order number)
router.get('/:orderId', getOrderById);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/:orderId/status', protect, admin, updateOrderStatus);
router.put('/:orderId/payment-status', protect, admin, updatePaymentStatus);

export default router;
