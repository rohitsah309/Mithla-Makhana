import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  discountType: {
    type: String,
    enum: ['percent', 'fixed'],
    default: 'percent'
  },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0, min: 0 },
  maxDiscount: { type: Number, default: null },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null }
}, {
  timestamps: true
});

export default mongoose.model('Coupon', couponSchema);
