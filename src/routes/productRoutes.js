import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.route('/')
  .get(productController.getProducts)
  .post(productController.createProduct);

// Add route for categories - MUST come before /:id to avoid conflict
router.route('/categories')
  .get(productController.getCategories);

router.route('/:id')
  .get(productController.getProductById)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

export default router;