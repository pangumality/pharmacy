import mongoose from 'mongoose';
import { reviewSchema } from './Review.js';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mainImage: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
      validate: [arr => arr.length > 0 && arr.length <= 4, 'Must have 1-4 images'],
    },
    category: {
      type: String,
      required: true,
      enum: ['skincare', 'body-care', 'gift-sets', 'accessories', 'oil', 'lotion', 'essentials'],
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    ingredients: {
      type: String,
      default: '',
    },
    benefits: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    howToUse: {
      type: String,
      default: '',
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;