import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  weight: { type: String, default: '250g' },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  items: [orderItemSchema],
  shippingAddress: { type: shippingAddressSchema, required: true },
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['razorpay', 'cod', 'card', 'upi'], 
    default: 'razorpay' 
  },
  orderStatus: { 
    type: String, 
    enum: [
      'Order Placed',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ], 
    default: 'Order Placed' 
  },
  statusHistory: [statusHistorySchema],
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
