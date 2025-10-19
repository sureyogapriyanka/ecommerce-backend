import express from 'express';
import cartController from '../controllers/CartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, cartController.getCart)
  .post(protect, cartController.addToCart)
  .delete(protect, cartController.clearCart);

router.route('/:id')
  .put(protect, cartController.updateCartItem)
  .delete(protect, cartController.removeFromCart);

export default router;
