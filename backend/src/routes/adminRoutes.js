import express from 'express';
const router = express.Router();
import { 
  getDashboardStats, 
  getUsers, 
  toggleUserBlock, 
  createAdmin, 
  updateUserRole,
  deleteUser,
  getStoreSettings,
  updateStoreSettings
} from '../controllers/adminController.js';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { protect, admin, superAdmin } from '../middleware/authMiddleware.js';

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:userId/block', toggleUserBlock);
router.put('/users/:userId/role', superAdmin, updateUserRole);
router.post('/admins', superAdmin, createAdmin);
router.delete('/users/:userId', deleteUser);
router.get('/settings', getStoreSettings);
router.put('/settings', updateStoreSettings);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

export default router;
