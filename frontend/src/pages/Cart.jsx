import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  Tag 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { couponAPI } from '../services/api';

const Cart = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    shippingFee, 
    freeShippingThreshold, 
    amountToFreeShipping, 
    total 
  } = useCart();
  const { isAuthenticated } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const { data } = await couponAPI.getAvailable();
        if (data?.success) {
          setAvailableCoupons(data.coupons || []);
        }
      } catch (err) {
        console.error('Failed to load customer coupons', err);
      } finally {
        setLoadingCoupons(false);
      }
    };

    loadCoupons();
  }, []);

  const formatCouponDiscount = (coupon) => {
    if (!coupon) return '';
    return coupon.discountType === 'fixed'
      ? `₹${coupon.discountValue} off`
      : `${coupon.discountValue}% off`;
  };

  const applyCouponCode = async (code) => {
    if (!code?.trim() || applyingCoupon) return;

    setApplyingCoupon(true);
    try {
      const { data } = await couponAPI.validate({
        code: code.trim(),
        subtotal
      });
      setDiscountAmount(data.discount || 0);
      setAppliedCoupon(data.coupon?.code || code.trim().toUpperCase());
      setCouponCode(data.coupon?.code || code.trim().toUpperCase());
      success(data.message || 'Coupon applied successfully!');
    } catch (err) {
      setDiscountAmount(0);
      setAppliedCoupon('');
      error(err.response?.data?.message || 'Invalid or expired coupon code.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    await applyCouponCode(couponCode);
  };

  const handleApplyOffer = async (coupon) => {
    if (!coupon?.code) return;
    await applyCouponCode(coupon.code);
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setAppliedCoupon('');
    setCouponCode('');
    info('Coupon removed.');
  };

  const finalTotal = Math.max(0, total - discountAmount);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-[#FAF6F0] border-2 border-[#E8DEC9] text-[#D99B26] mx-auto flex items-center justify-center shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B]">Your Cart is Empty</h2>
        <p className="text-sm text-[#6D4A32] max-w-md mx-auto">
          Explore our collection of authentic plain, slow-roasted, and regional spiced makhana from Bihar.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#4A2E1B] text-[#FAF6F0] font-semibold text-sm hover:bg-[#27170E] shadow-soft transition-all"
        >
          <span>Explore Makhana Flavours</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="border-b border-[#E8DEC9] pb-4 flex items-baseline justify-between">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B]">
          Your Shopping Cart
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 underline font-medium"
        >
          Clear All Items
        </button>
      </div>

      {/* Free Shipping Alert Bar */}
      <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#E8DEC9] flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs sm:text-sm">
          <Truck className="w-5 h-5 text-[#2D5A27] flex-shrink-0" />
          {amountToFreeShipping > 0 ? (
            <p className="text-[#6D4A32]">
              Add <span className="font-bold text-[#4A2E1B]">₹{amountToFreeShipping}</span> more of fresh makhana for <span className="font-bold text-[#2D5A27]">FREE shipping</span> across India!
            </p>
          ) : (
            <p className="text-[#2D5A27] font-semibold">
              🎉 Congratulations! You have unlocked FREE Express Shipping on this order.
            </p>
          )}
        </div>
        <Link to="/shop" className="text-xs font-bold text-[#D99B26] hover:underline hidden sm:block">
          Add More Items
        </Link>
      </div>

      {/* Cart Grid: Items on Left, Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <div
              key={`${item.id}_${item.weight}`}
              className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E8DEC9] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-[#E8DEC9] bg-[#FAF6F0] flex-shrink-0"
                />
                <div className="space-y-1">
                  <Link
                    to={`/product/${item.slug || item.id}`}
                    className="font-serif text-lg font-bold text-[#4A2E1B] hover:text-[#D99B26] transition-colors leading-tight line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-[#8A6D56]">
                    Pack: <span className="font-semibold text-[#4A2E1B]">{item.weight}</span>
                  </p>
                  <p className="text-xs font-bold text-[#4A2E1B]">₹{item.price} each</p>
                </div>
              </div>

              {/* Quantity Stepper & Price */}
              <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="flex items-center border border-[#E8DEC9] rounded-xl bg-[#FAF6F0]">
                  <button
                    onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                    className="p-1.5 text-[#4A2E1B] hover:bg-[#E8DEC9] rounded-l-xl transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-[#4A2E1B]">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                    className="p-1.5 text-[#4A2E1B] hover:bg-[#E8DEC9] rounded-r-xl transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-bold text-base text-[#4A2E1B] block">₹{item.subtotal}</span>
                  <button
                    onClick={() => removeFromCart(item.id, item.weight)}
                    className="text-[11px] text-red-500 hover:text-red-700 inline-flex items-center space-x-1 mt-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#4A2E1B] border-b border-[#E8DEC9] pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-[#6D4A32]">
            <div className="flex justify-between">
              <span>Cart Subtotal</span>
              <span className="font-semibold text-[#4A2E1B]">₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              {shippingFee === 0 ? (
                <span className="font-bold text-[#2D5A27]">FREE</span>
              ) : (
                <span className="font-semibold text-[#4A2E1B]">₹{shippingFee}</span>
              )}
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-[#2D5A27] font-semibold">
                <span>Coupon Discount ({appliedCoupon})</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="border-t border-[#E8DEC9] pt-3 flex justify-between text-base font-bold text-[#4A2E1B]">
              <span>Estimated Total</span>
              <span className="text-xl">₹{finalTotal}</span>
            </div>
            <p className="text-[10px] text-[#8A6D56]">Taxes calculated and included.</p>
          </div>

          {/* Coupon Input */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#4A2E1B] flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>Apply Discount Coupon</span>
            </label>

            {!loadingCoupons && availableCoupons.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A6D56]">
                  Available Offers
                </p>
                {availableCoupons.map((coupon) => {
                  const isEligible = subtotal >= Number(coupon.minOrderAmount || 0);
                  return (
                    <div
                      key={coupon._id || coupon.code}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        appliedCoupon === coupon.code
                          ? 'bg-[#EAF3E7] border-[#2D5A27]/30'
                          : 'bg-[#FEF8EA] border-[#D99B26]/25 hover:border-[#D99B26] hover:bg-[#FFF4D8]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[#4A2E1B] bg-white px-2 py-0.5 rounded-lg border border-[#E8DEC9]">
                              {coupon.code}
                            </span>
                            <span className="text-[10px] font-bold text-[#2D5A27]">
                              {formatCouponDiscount(coupon)}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#4A2E1B] mt-2">{coupon.title}</p>
                          {coupon.description && (
                            <p className="text-[10px] text-[#8A6D56] mt-0.5">{coupon.description}</p>
                          )}
                          {Number(coupon.minOrderAmount) > 0 && (
                            <p className={`text-[10px] mt-1 font-semibold ${isEligible ? 'text-[#2D5A27]' : 'text-[#B07812]'}`}>
                              Min order ₹{coupon.minOrderAmount}
                            </p>
                          )}
                        </div>
                        {appliedCoupon === coupon.code ? (
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-[10px] font-bold text-red-600 shrink-0 px-2 py-1 rounded-lg bg-white border border-red-200 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApplyOffer(coupon)}
                            disabled={applyingCoupon}
                            className="text-[10px] font-bold text-[#4A2E1B] shrink-0 px-2 py-1 rounded-lg bg-white border border-[#D99B26]/40 hover:bg-[#F3ECE2] disabled:opacity-50"
                          >
                            {applyingCoupon ? 'Applying' : 'Apply'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] uppercase text-[#4A2E1B]"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon}
                  className="px-4 py-2 bg-[#FAF6F0] border border-[#D99B26] text-[#4A2E1B] text-xs font-bold rounded-xl hover:bg-[#F3ECE2] transition-colors disabled:opacity-50"
                >
                  {applyingCoupon ? 'Checking…' : 'Apply'}
                </button>
              </div>
              <p className="text-[10px] text-[#8A6D56]">Choose an offer above or enter a valid promo code.</p>
            </form>
          </div>

          {/* Proceed to Checkout Button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                info('Please sign in to proceed with your order.');
                navigate('/login?redirect=/checkout');
              } else {
                navigate('/checkout');
              }
            }}
            className="w-full py-3.5 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-sm shadow-card flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center text-[11px] text-[#8A6D56] flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>Safe & Secure Indian Payment Gateways</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Cart;
