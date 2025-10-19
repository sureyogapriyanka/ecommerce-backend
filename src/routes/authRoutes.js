import express from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Remove the debugging middleware that might interfere
// router.use((req, res, next) => {
//   console.log(`Auth route accessed: ${req.method} ${req.url}`);
//   next();
// });

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

router
  .route('/profile')
  .get(protect, authController.getUserProfile)
  .put(protect, authController.updateUserProfile);

export default router;