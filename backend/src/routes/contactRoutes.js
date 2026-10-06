import express from 'express';
const router = express.Router();
import {
  submitMessage,
  getMessages,
  updateMessageStatus
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/', submitMessage);
router.get('/', protect, admin, getMessages);
router.put('/:id', protect, admin, updateMessageStatus);

export default router;
