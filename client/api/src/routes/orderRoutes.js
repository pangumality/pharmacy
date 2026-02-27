import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getUserOrders,
  getOrders,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/orders
// @route   GET /api/orders
router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

// @route   GET /api/orders/myorders
router.route('/myorders').get(protect, getUserOrders);

// @route   GET /api/orders/:id
router.route('/:id').get(protect, getOrderById);

// @route   PUT /api/orders/:id/pay
router.route('/:id/pay').put(protect, updateOrderToPaid);

// @route   PUT /api/orders/:id/deliver
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

// @route   PUT /api/orders/:id/status
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router; 