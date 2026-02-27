import Review from '../models/Review.js';
import Product from '../models/Product.js';

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Create new review
    const review = new Review({
      name: `${req.user.firstName} ${req.user.lastName}`,
      rating: Number(rating),
      comment,
      user: req.user._id,
      product: productId
    });

    const createdReview = await review.save();

    // Update product rating and numReviews
    const allProductReviews = await Review.find({ product: productId });
    
    product.numReviews = allProductReviews.length;
    product.rating = 
      allProductReviews.reduce((acc, item) => item.rating + acc, 0) / 
      allProductReviews.length;

    await product.save();

    res.status(201).json(createdReview);
  } catch (error) {
    console.error('Create review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the review belongs to the user
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this review' });
    }
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    
    const updatedReview = await review.save();
    
    // Update product rating
    const productId = review.product;
    const allProductReviews = await Review.find({ product: productId });
    
    const product = await Product.findById(productId);
    product.rating = 
      allProductReviews.reduce((acc, item) => item.rating + acc, 0) / 
      allProductReviews.length;
    
    await product.save();
    
    res.json(updatedReview);
  } catch (error) {
    console.error('Update review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the review belongs to the user or user is admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this review' });
    }
    
    const productId = review.product;
    
    await review.deleteOne();
    
    // Update product rating and numReviews
    const allProductReviews = await Review.find({ product: productId });
    
    const product = await Product.findById(productId);
    product.numReviews = allProductReviews.length;
    
    if (allProductReviews.length > 0) {
      product.rating = 
        allProductReviews.reduce((acc, item) => item.rating + acc, 0) / 
        allProductReviews.length;
    } else {
      product.rating = 0;
    }
    
    await product.save();
    
    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error('Delete review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}; 