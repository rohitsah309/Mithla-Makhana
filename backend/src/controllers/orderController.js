import Store from '../services/store.js';
import * as couponService from '../services/couponService.js';

// @desc    Create new order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      customer,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
      couponCode
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. No items to order.'
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required.'
      });
    }

    // Calculate subtotal using live store delivery rules
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const settings = Store.getSettings();
    const parsedThreshold = Number(settings.freeShippingThreshold);
    const parsedFee = Number(settings.standardShippingFee);
    const freeShippingThreshold = Number.isFinite(parsedThreshold) ? parsedThreshold : 499;
    const standardShippingFee = Number.isFinite(parsedFee) ? parsedFee : 50;
    const shippingFee = subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
    const couponResult = couponCode ? await couponService.validateCoupon(couponCode, subtotal) : null;
    if (couponCode && !couponResult?.valid) {
      return res.status(400).json({
        success: false,
        message: couponResult?.message || 'Invalid coupon code.'
      });
    }
    const discount = couponResult?.discount || 0;
    const total = Math.max(0, subtotal + shippingFee - discount);

    const orderData = {
      user: req.user ? req.user._id : 'guest',
      customer: customer || {
        name: shippingAddress.fullName,
        email: shippingAddress.email || (req.user ? req.user.email : ''),
        phone: shippingAddress.mobile
      },
      items,
      shippingAddress,
      subtotal,
      shippingFee,
      discount,
      coupon: couponResult?.coupon || null,
      total,
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'completed'),
      razorpayOrderId: razorpayOrderId || '',
      razorpayPaymentId: razorpayPaymentId || ''
    };

    const newOrder = Store.createOrder(orderData);
    if (couponResult?.coupon?.code) {
      await couponService.incrementCouponUsage(couponResult.coupon.code);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for ordering from Mithila Makhana.',
      order: newOrder
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = Store.getOrders({ userId: req.user._id });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order details / tracking by Order ID or Mongo ID
// @route   GET /api/orders/:orderId
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = Store.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderId} not found. Please check your order reference.`
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const orders = Store.getOrders({ status, search });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:orderId/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, notes, courier, trackingNumber, estimatedDelivery } = req.body;

    const validStatuses = [
      'Order Placed',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = Store.updateOrderStatus(orderId, status, notes, {
      courier,
      trackingNumber,
      estimatedDelivery
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      order: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order payment status (Admin - especially for COD orders)
// @route   PUT /api/orders/:orderId/payment-status
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, notes } = req.body;

    const validStatuses = ['completed', 'pending', 'failed'];
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = Store.updatePaymentStatus(orderId, paymentStatus, notes);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: `Payment status updated to "${paymentStatus === 'completed' ? 'Payment Received' : 'Payment Pending'}"`,
      order: updated
    });
  } catch (err) {
    next(err);
  }
};

export {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus
};
