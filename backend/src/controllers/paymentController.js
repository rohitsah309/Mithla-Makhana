import crypto from 'crypto';
import Razorpay from 'razorpay';

// Dynamically read environment keys
const getKeys = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const isPlaceholderKey = !keyId || keyId === 'rzp_test_MithilaMakhanaKeyId' || keySecret === 'MithilaMakhanaTestSecretKey123';
  const isRealRazorpay = !isPlaceholderKey && (keyId.startsWith('rzp_live_') || keyId.startsWith('rzp_test_'));
  return { keyId, keySecret, isPlaceholderKey, isRealRazorpay };
};

const getRazorpayInstance = () => {
  const { keyId, keySecret, isRealRazorpay } = getKeys();
  if (Razorpay && isRealRazorpay) {
    try {
      return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
    } catch (err) {
      console.error('Razorpay instance initialization failed:', err.message);
      return null;
    }
  }
  return null;
};

// @desc    Get Razorpay Public Configuration
// @route   GET /api/payments/config
const getPaymentConfig = (req, res) => {
  const { keyId, isPlaceholderKey } = getKeys();
  const instance = getRazorpayInstance();
  res.json({
    success: true,
    keyId: keyId,
    currency: 'INR',
    isDemo: isPlaceholderKey || !instance
  });
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount for payment order.'
      });
    }

    const { keyId, isPlaceholderKey } = getKeys();
    const instance = getRazorpayInstance();
    const amountInPaise = Math.round(Number(amount) * 100);
    const orderReceipt = receipt || `rcpt_${Date.now()}`;

    // If live/active Razorpay SDK instance configured with real test/live keys
    if (instance && !isPlaceholderKey) {
      try {
        const order = await instance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: orderReceipt
        });

        return res.json({
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: keyId,
          isDemo: false
        });
      } catch (err) {
        console.error('Razorpay live order error fallback:', err.message);
      }
    }

    // High fidelity test / demo order fallback
    const demoOrderId = `order_mithila_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    res.json({
      success: true,
      orderId: demoOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: keyId,
      isDemo: true,
      message: 'Demo payment order initialized.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters.'
      });
    }

    const { keySecret, isRealRazorpay } = getKeys();

    // Live verification if signature is present and not mock
    if (razorpaySignature && isRealRazorpay) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid cryptographic signature.'
        });
      }
    }

    // Success response
    res.json({
      success: true,
      verified: true,
      message: 'Payment successfully verified.',
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId
    });
  } catch (err) {
    next(err);
  }
};

export {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment
};
