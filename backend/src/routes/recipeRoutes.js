import express from 'express';
const router = express.Router();
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe
} from '../controllers/recipeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get('/', getRecipes);
router.get('/:slugOrId', getRecipe);

// Admin Routes
router.post('/', protect, admin, createRecipe);
router.put('/:id', protect, admin, updateRecipe);
router.delete('/:id', protect, admin, deleteRecipe);

export default router;
