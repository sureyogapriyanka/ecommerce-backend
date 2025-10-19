import express from 'express';
import wishlistController from '../controllers/WishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, wishlistController.getWishlist)
  .post(protect, wishlistController.addToWishlist)
  .delete(protect, wishlistController.clearWishlist);

router.route('/:id')
  .delete(protect, wishlistController.removeFromWishlist);

export default router;
