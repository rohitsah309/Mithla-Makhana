import * as couponService from '../services/couponService.js';

// @desc    Get active coupons for customer cart / checkout
// @route   GET /api/coupons
const getAvailableCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.getAvailableCoupons();
    res.json({ success: true, count: coupons.length, coupons });
  } catch (err) {
    next(err);
  }
};

// @desc    Validate coupon for customer cart / checkout
// @route   POST /api/coupons/validate
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required.'
      });
    }

    const result = await couponService.validateCoupon(code, subtotal);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully.',
      discount: result.discount,
      coupon: result.coupon
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/admin/coupons
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.getCoupons();
    res.json({ success: true, count: coupons.length, coupons });
  } catch (err) {
    next(err);
  }
};

// @desc    Create coupon (Admin)
// @route   POST /api/admin/coupons
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountValue } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }
    if (!discountValue || Number(discountValue) <= 0) {
      return res.status(400).json({ success: false, message: 'Discount value must be greater than zero.' });
    }

    const created = await couponService.createCoupon(req.body);
    if (!created) {
      return res.status(400).json({ success: false, message: 'Failed to create coupon.' });
    }
    if (created.error) {
      return res.status(400).json({ success: false, message: created.error });
    }

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      coupon: created
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/admin/coupons/:id
const updateCoupon = async (req, res, next) => {
  try {
    const updated = await couponService.updateCoupon(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    if (updated.error) {
      return res.status(400).json({ success: false, message: updated.error });
    }

    res.json({
      success: true,
      message: 'Coupon updated successfully.',
      coupon: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/admin/coupons/:id
const deleteCoupon = async (req, res, next) => {
  try {
    const removed = await couponService.deleteCoupon(req.params.id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

export {
  getAvailableCoupons,
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
