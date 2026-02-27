import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Log the directory path for debugging
console.log('Upload routes directory path:', uploadDir);

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Filter to accept only images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
};

// Initialize upload with storage, limits, and filter
const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB
  fileFilter
}).single('image');

// Add a new route for multiple image upload
const multiUpload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter
}).array('images', 4); // up to 4 images

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, (req, res) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File is too large',
          details: 'Maximum file size allowed is 12MB'
        });
      }
      return res.status(400).json({ 
        message: 'File upload error',
        details: err.message
      });
    } else if (err) {
      // Other errors (including file type validation)
      return res.status(400).json({ 
        message: 'Invalid file type',
        details: 'Only image files (jpeg, jpg, png, webp) are allowed'
      });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file uploaded',
        details: 'Please select a file to upload'
      });
    }

    // Create URL based on server
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
    const serverURL = `${protocol}://${req.get('host')}`;
    const imageUrl = `${serverURL}/uploads/${req.file.filename}`;
    
    console.log('Image uploaded successfully:', req.file.path);
    console.log('Generated URL:', imageUrl);

    res.status(201).json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  });
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Admin
router.post('/multiple', protect, admin, (req, res) => {
  multiUpload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File is too large',
          details: 'Maximum file size allowed is 12MB per image'
        });
      }
      return res.status(400).json({
        message: 'File upload error',
        details: err.message
      });
    } else if (err) {
      return res.status(400).json({
        message: 'Invalid file type',
        details: 'Only image files (jpeg, jpg, png, webp) are allowed'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'No files uploaded',
        details: 'Please select up to 4 images to upload'
      });
    }

    const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
    const serverURL = `${protocol}://${req.get('host')}`;
    const imageUrls = req.files.map(file => `${serverURL}/uploads/${file.filename}`);

    res.status(201).json({
      message: 'Images uploaded successfully',
      imageUrls
    });
  });
});

// @desc    Delete an image
// @route   DELETE /api/upload/:filename
// @access  Private/Admin
router.delete('/:filename', protect, admin, (req, res) => {
  try {
    const { filename } = req.params;
    
    // Ensure filename is safe (no path traversal)
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(uploadDir, sanitizedFilename);
    
    console.log('Attempting to delete file:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found for deletion:', filePath);
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    console.log('Image deleted successfully:', filePath);
    
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

export default router; 