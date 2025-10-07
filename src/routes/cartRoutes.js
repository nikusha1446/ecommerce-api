import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addToCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/items', protect, addToCart);

export default router;
