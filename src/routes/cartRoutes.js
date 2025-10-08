import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../controllers/cartController.js';

const router = express.Router();

router.post('/items', protect, addToCart);
router.get('/items', protect, getCart);
router.put('/items/:id', protect, updateCartItem);
router.delete('/items/:id', protect, removeCartItem);

export default router;
