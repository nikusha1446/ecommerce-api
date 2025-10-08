import express from 'express';
import {
  createCheckout,
  testConfirmPayment,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', protect, createCheckout);
router.post('/test-confirm', testConfirmPayment);

export default router;
