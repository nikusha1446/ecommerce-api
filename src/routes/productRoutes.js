import express from 'express';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', protect, restrictTo('ADMIN'), createProduct);
router.put('/:id', protect, restrictTo('ADMIN'), updateProduct);
router.delete('/:id', protect, restrictTo('ADMIN'), deleteProduct);

export default router;
