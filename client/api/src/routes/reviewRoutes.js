import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/reviews
router.route('/')
  .post(protect, createReview);

// @route   GET /api/reviews/product/:productId
router.route('/product/:productId')
  .get(getProductReviews);

// @route   PUT /api/reviews/:id
// @route   DELETE /api/reviews/:id
router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export default router; 