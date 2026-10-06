import express from 'express';
const router = express.Router();
import {
  sendRegisterOtp,
  verifyOtpOnly,
  register,
  login,
  forgotPassword,
  validateResetOtp,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  toggleWishlist,
  getWishlist
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/send-register-otp', sendRegisterOtp);
router.post('/verify-otp', verifyOtpOnly);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/validate-reset-otp', validateResetOtp);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/toggle', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

export default router;
