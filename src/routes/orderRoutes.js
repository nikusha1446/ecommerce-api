import express from 'express';
import {
  confirmPayment,
  createCheckout,
  getOrderById,
  getOrders,
  testConfirmPayment,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', protect, createCheckout);
router.post('/test-confirm', testConfirmPayment);
router.post('/confirm', protect, confirmPayment);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

export default router;
