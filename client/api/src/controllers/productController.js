import Product from '../models/Product.js';
import Review from '../models/Review.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};
      
    const category = req.query.category ? { category: req.query.category } : {};
    const minPrice = req.query.minPrice ? { price: { $gte: Number(req.query.minPrice) } } : {};
    const maxPrice = req.query.maxPrice ? { price: { $lte: Number(req.query.maxPrice) } } : {};
    
    // Combine filters
    const filter = {
      ...keyword,
      ...category,
      ...(req.query.minPrice || req.query.maxPrice ? { price: { 
        ...(req.query.minPrice ? { $gte: Number(req.query.minPrice) } : {}),
        ...(req.query.maxPrice ? { $lte: Number(req.query.maxPrice) } : {})
      }} : {})
    };

    // If no pagination is requested, return all products
    const count = await Product.countDocuments(filter);
    
    let query = Product.find(filter);
    
    // Apply pagination only if page is specified
    if (req.query.page) {
      query = query.limit(pageSize).skip(pageSize * (page - 1));
    }

    const products = await query;

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count
    });
  } catch (error) {
    console.error('Get products error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Get product error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      mainImage,
      images,
      category,
      countInStock,
      featured,
      brand,
      sku,
      ingredients,
      benefits,
      size,
      howToUse
    } = req.body;

    // Validate images
    if (!Array.isArray(images) || images.length < 1 || images.length > 4) {
      return res.status(400).json({ message: 'You must provide 1-4 images.' });
    }
    if (!mainImage || !images.includes(mainImage)) {
      return res.status(400).json({ message: 'mainImage must be one of the images.' });
    }

    const product = new Product({
      name,
      price,
      description,
      mainImage,
      images,
      category,
      countInStock: countInStock || 0,
      rating: 0,
      numReviews: 0,
      featured: featured || false,
      brand: brand || '',
      sku: sku || '',
      ingredients: ingredients || '',
      benefits: benefits || '',
      size: size || '',
      howToUse: howToUse || ''
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Create product error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      mainImage,
      images,
      category,
      countInStock,
      featured,
      brand,
      sku,
      ingredients,
      benefits,
      size,
      howToUse
    } = req.body;

    // Validate images
    if (!Array.isArray(images) || images.length < 1 || images.length > 4) {
      return res.status(400).json({ message: 'You must provide 1-4 images.' });
    }
    if (!mainImage || !images.includes(mainImage)) {
      return res.status(400).json({ message: 'mainImage must be one of the images.' });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.mainImage = mainImage || product.mainImage;
      product.images = images || product.images;
      product.category = category || product.category;
      product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
      product.featured = featured !== undefined ? featured : product.featured;
      product.brand = brand !== undefined ? brand : product.brand;
      product.sku = sku !== undefined ? sku : product.sku;
      product.ingredients = ingredients !== undefined ? ingredients : product.ingredients;
      product.benefits = benefits !== undefined ? benefits : product.benefits;
      product.size = size !== undefined ? size : product.size;
      product.howToUse = howToUse !== undefined ? howToUse : product.howToUse;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update product error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Remove associated image files from disk
      const fs = await import('fs');
      const path = await import('path');
      const uploadDir = path.resolve('uploads');

      // Helper to delete a file if it exists
      const deleteFile = (filename) => {
        if (!filename) return;
        const sanitized = path.basename(filename);
        const filePath = path.join(uploadDir, sanitized);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log('Deleted image:', filePath);
          } catch (err) {
            console.error('Failed to delete image:', filePath, err);
          }
        }
      };

      // Delete mainImage if not a URL (local file)
      if (product.mainImage && !product.mainImage.startsWith('http')) {
        deleteFile(product.mainImage);
      }
      // Delete all images in images[] if not URLs
      if (Array.isArray(product.images)) {
        product.images.forEach(img => {
          if (img && !img.startsWith('http')) deleteFile(img);
        });
      }

      await product.deleteOne();
      res.json({ message: 'Product and associated images removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user already submitted a review
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: `${req.user.firstName} ${req.user.lastName}`,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Create review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
export const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    console.error('Get top products error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an image from a product and from disk
// @route   DELETE /api/products/:id/image/:filename
// @access  Private/Admin
export const deleteProductImage = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove image from images array and mainImage if needed
    const sanitizedFilename = require('path').basename(filename);
    const updatedImages = product.images.filter(img => img !== sanitizedFilename);
    let mainImageChanged = false;
    if (product.mainImage === sanitizedFilename) {
      product.mainImage = updatedImages.length > 0 ? updatedImages[0] : '';
      mainImageChanged = true;
    }
    product.images = updatedImages;

    await product.save();

    // Delete file from disk
    const path = require('path');
    const fs = require('fs');
    const uploadDir = path.resolve('uploads');
    const filePath = path.join(uploadDir, sanitizedFilename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('Deleted image:', filePath);
      } catch (err) {
        console.error('Failed to delete image:', filePath, err);
        return res.status(500).json({ message: 'Failed to delete image from disk' });
      }
    }

    res.json({ message: `Image deleted${mainImageChanged ? ' and mainImage updated' : ''}` });
  } catch (error) {
    console.error('Delete product image error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};