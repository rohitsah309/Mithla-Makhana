import express from 'express';
const router = express.Router();
import { getAvailableCoupons, validateCoupon } from '../controllers/couponController.js';

router.get('/', getAvailableCoupons);
router.post('/validate', validateCoupon);

export default router;
