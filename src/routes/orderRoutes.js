import express from 'express';
import orderController from '../controllers/OrderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.route('/')
  .post(protect, orderController.createOrder)
  .get(protect, orderController.getMyOrders);

// Get all orders (admin only)
router.route('/all')
  .get(protect, orderController.getAllOrders);

// Single order routes
router.route('/:id')
  .get(protect, orderController.getOrderById);

// Update order status (admin only)
router.route('/:id/status')
  .put(protect, orderController.updateOrderStatus);

export default router;
