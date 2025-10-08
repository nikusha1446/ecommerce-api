import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addToCart,
  getCart,
  updateCartItem,
} from '../controllers/cartController.js';

const router = express.Router();

router.post('/items', protect, addToCart);
router.get('/items', protect, getCart);
router.put('/items/:id', protect, updateCartItem);

export default router;
