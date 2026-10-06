import mongoose from 'mongoose';
import Coupon from '../models/Coupon.js';

const requireMongo = () => {
  if (mongoose.connection.readyState !== 1) {
    const err = new Error('MongoDB is required for coupon storage. Please configure MONGO_URI and ensure the database is connected.');
    err.statusCode = 503;
    throw err;
  }
};

const normalizeCode = (code) => String(code || '').trim().toUpperCase();

const serializeCoupon = (coupon) => {
  if (!coupon) return null;
  const doc = typeof coupon.toObject === 'function' ? coupon.toObject() : coupon;
  return {
    ...doc,
    _id: String(doc._id),
    expiresAt: doc.expiresAt ? new Date(doc.expiresAt).toISOString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : doc.updatedAt
  };
};

const isAvailable = (coupon) => {
  if (!coupon || !coupon.isActive) return false;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return false;
  if (coupon.usageLimit != null && Number(coupon.usedCount) >= Number(coupon.usageLimit)) return false;
  return true;
};

const toPublicCoupon = (coupon) => ({
  _id: String(coupon._id),
  code: coupon.code,
  title: coupon.title,
  description: coupon.description,
  discountType: coupon.discountType,
  discountValue: coupon.discountValue,
  minOrderAmount: coupon.minOrderAmount,
  maxDiscount: coupon.maxDiscount,
  expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString() : null
});

const getCoupons = async () => {
  requireMongo();
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
  return coupons.map(serializeCoupon);
};

const getAvailableCoupons = async () => {
  requireMongo();
  const coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return coupons.filter(isAvailable).map(toPublicCoupon);
};

const validateCoupon = async (code, subtotal = 0) => {
  requireMongo();
  const normalized = normalizeCode(code);
  const orderAmount = Number(subtotal) || 0;
  const coupon = await Coupon.findOne({ code: normalized }).lean();

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code.' };
  }
  if (!coupon.isActive) {
    return { valid: false, message: 'This coupon is no longer active.' };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, message: 'This coupon has expired.' };
  }
  if (Number(coupon.minOrderAmount) > 0 && orderAmount < Number(coupon.minOrderAmount)) {
    return { valid: false, message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon.` };
  }
  if (coupon.usageLimit != null && Number(coupon.usedCount) >= Number(coupon.usageLimit)) {
    return { valid: false, message: 'This coupon has reached its usage limit.' };
  }

  let discount = 0;
  if (coupon.discountType === 'fixed') {
    discount = Number(coupon.discountValue) || 0;
  } else {
    discount = Math.round(orderAmount * (Number(coupon.discountValue) || 0) / 100);
    if (coupon.maxDiscount != null && Number(coupon.maxDiscount) > 0) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }
  }
  discount = Math.min(Math.max(0, discount), orderAmount);

  return {
    valid: true,
    discount,
    coupon: {
      _id: String(coupon._id),
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    }
  };
};

const createCoupon = async (couponData) => {
  requireMongo();
  const code = normalizeCode(couponData.code);
  if (!code) return null;

  const existing = await Coupon.findOne({ code }).lean();
  if (existing) {
    return { error: 'A coupon with this code already exists.' };
  }

  const coupon = await Coupon.create({
    code,
    title: couponData.title || code,
    description: couponData.description || '',
    discountType: couponData.discountType === 'fixed' ? 'fixed' : 'percent',
    discountValue: Math.max(0, Number(couponData.discountValue) || 0),
    minOrderAmount: Math.max(0, Number(couponData.minOrderAmount) || 0),
    maxDiscount: couponData.maxDiscount != null && couponData.maxDiscount !== ''
      ? Math.max(0, Number(couponData.maxDiscount))
      : null,
    usageLimit: couponData.usageLimit != null && couponData.usageLimit !== ''
      ? Math.max(1, Number(couponData.usageLimit))
      : null,
    usedCount: 0,
    isActive: couponData.isActive !== false,
    expiresAt: couponData.expiresAt || null
  });

  return serializeCoupon(coupon);
};

const updateCoupon = async (id, updateData) => {
  requireMongo();
  const coupon = await Coupon.findById(id);
  if (!coupon) return null;

  if (updateData.code) {
    const code = normalizeCode(updateData.code);
    const existing = await Coupon.findOne({ code, _id: { $ne: coupon._id } }).lean();
    if (existing) {
      return { error: 'A coupon with this code already exists.' };
    }
    coupon.code = code;
  }

  if (updateData.title !== undefined) coupon.title = updateData.title || coupon.code;
  if (updateData.description !== undefined) coupon.description = updateData.description || '';
  if (updateData.discountType !== undefined) coupon.discountType = updateData.discountType === 'fixed' ? 'fixed' : 'percent';
  if (updateData.discountValue !== undefined) coupon.discountValue = Math.max(0, Number(updateData.discountValue) || 0);
  if (updateData.minOrderAmount !== undefined) coupon.minOrderAmount = Math.max(0, Number(updateData.minOrderAmount) || 0);
  if (updateData.maxDiscount !== undefined) {
    coupon.maxDiscount = updateData.maxDiscount != null && updateData.maxDiscount !== ''
      ? Math.max(0, Number(updateData.maxDiscount))
      : null;
  }
  if (updateData.usageLimit !== undefined) {
    coupon.usageLimit = updateData.usageLimit != null && updateData.usageLimit !== ''
      ? Math.max(1, Number(updateData.usageLimit))
      : null;
  }
  if (updateData.isActive !== undefined) coupon.isActive = updateData.isActive !== false;
  if (updateData.expiresAt !== undefined) coupon.expiresAt = updateData.expiresAt || null;

  await coupon.save();
  return serializeCoupon(coupon);
};

const deleteCoupon = async (id) => {
  requireMongo();
  const removed = await Coupon.findByIdAndDelete(id);
  return Boolean(removed);
};

const incrementCouponUsage = async (code) => {
  requireMongo();
  const updated = await Coupon.findOneAndUpdate(
    { code: normalizeCode(code) },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
  return serializeCoupon(updated);
};

export {
  getCoupons,
  getAvailableCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  incrementCouponUsage
};
