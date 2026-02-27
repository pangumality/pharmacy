import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/users
router.post('/', registerUser);

// @route   POST /api/users/login
router.post('/login', loginUser);

// @route   GET /api/users/profile
// @route   PUT /api/users/profile
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin Routes
// @route   GET /api/users
router.get('/', protect, admin, getAllUsers);

// @route   GET /api/users/stats
router.get('/stats', protect, admin, getUserStats);

// @route   GET /api/users/:id
// @route   PUT /api/users/:id
// @route   DELETE /api/users/:id
router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router; 