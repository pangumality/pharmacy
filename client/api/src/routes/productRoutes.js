import express from 'express';

import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  deleteProductImage,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   DELETE /api/products/:id/image/:filename
router.delete('/:id/image/:filename', protect, admin, deleteProductImage);

// @route   GET /api/products
// @route   POST /api/products
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// @route   GET /api/products/featured
router.get('/featured', getFeaturedProducts);

// @route   GET /api/products/top
router.get('/top', getTopProducts);

// @route   POST /api/products/:id/reviews
router.route('/:id/reviews')
  .post(protect, createProductReview);

// @route   GET /api/products/:id
// @route   PUT /api/products/:id
// @route   DELETE /api/products/:id
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router; 