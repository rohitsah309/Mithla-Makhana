import express from 'express';
const router = express.Router();
import {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment
} from '../controllers/paymentController.js';

router.get('/config', getPaymentConfig);
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

export default router;
