import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getCategories
} from '../controllers/productController.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';

router.get('/categories/all', getCategories);
router.get('/', getProducts);
router.get('/:slugOrId', getProduct);

// Protected Admin Routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Customer Review
router.post('/:id/reviews', optionalAuth, addReview);

export default router;
