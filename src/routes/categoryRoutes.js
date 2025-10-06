import express from 'express';
import {
  createCategory,
  getAllCategories,
} from '../controllers/categoryController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', protect, restrictTo('ADMIN'), createCategory);

export default router;
