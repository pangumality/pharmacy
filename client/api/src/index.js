import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

// Initialize dotenv
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Configure __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadDir}`);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Log the absolute path for debugging
console.log('Uploads directory path:', uploadDir);

// Serve uploaded files as static
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/email', emailRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const buildPath = path.resolve(__dirname, '../../dist');
  
  app.use(express.static(buildPath));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
  });
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Load MongoDB URI from environment variable or use default
    const mongoURI = process.env.MONGODB_URI || `mongodb://hello260:hello260_pass@127.0.0.1:27017/hello260?authSource=admin`;
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
