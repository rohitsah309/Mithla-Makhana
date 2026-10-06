import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Sparkles,
  Plus,
  MapPin,
  X,
  Star,
  ExternalLink,
  XCircle,
  AlertCircle,
  Tag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { couponAPI, orderAPI, paymentAPI } from '../services/api';

const Checkout = () => {
  const { cartItems, subtotal, shippingFee, freeShippingThreshold, total, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const hasSavedAddresses = Boolean(user?.addresses && user.addresses.length > 0);

  // Selected saved address index (defaults to default address or first address)
  const [selectedSavedAddrIndex, setSelectedSavedAddrIndex] = useState(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defIdx = user.addresses.findIndex((a) => a.isDefault);
      return defIdx !== -1 ? defIdx : 0;
    }
    return 0;
  });

  // If user has saved addresses, form is hidden by default; otherwise shown
  const [showNewAddressForm, setShowNewAddressForm] = useState(!hasSavedAddresses);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [setAsDefaultOnSave, setSetAsDefaultOnSave] = useState(false);

  // Address Form State for new address entry
  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [formData, setFormData] = useState({
    fullName: defaultAddr?.fullName || user?.name || '',
    email: user?.email || '',
    mobile: defaultAddr?.phone || user?.phone || '',
    address: defaultAddr?.address || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || 'Bihar',
    pincode: defaultAddr?.pincode || ''
  });

  // Sync when user profile loads asynchronously
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defIdx = user.addresses.findIndex((a) => a.isDefault);
      const chosenIdx = defIdx !== -1 ? defIdx : 0;
      setSelectedSavedAddrIndex(chosenIdx);
      setShowNewAddressForm(false);
      const addr = user.addresses[chosenIdx];
      setFormData({
        fullName: addr.fullName || user.name || '',
        email: user.email || '',
        mobile: addr.phone || user.phone || '',
        address: addr.address || '',
        city: addr.city || '',
        state: addr.state || 'Bihar',
        pincode: addr.pincode || ''
      });
    } else if (user) {
      setShowNewAddressForm(true);
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        mobile: prev.mobile || user.phone || ''
      }));
    }
  }, [user]);

  const handleSelectSavedAddress = (addr, idx) => {
    setSelectedSavedAddrIndex(idx);
    setShowNewAddressForm(false);
    setFormData({
      fullName: addr.fullName,
      email: user?.email || formData.email || '',
      mobile: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
    info(`Selected address: ${addr.fullName}`);
  };

  const handleOpenNewAddressForm = () => {
    setShowNewAddressForm(true);
    setFormData({
      fullName: user?.name || '',
      email: user?.email || '',
      mobile: user?.phone || '',
      address: '',
      city: '',
      state: 'Bihar',
      pincode: ''
    });
  };

  const handleCancelNewAddress = () => {
    if (hasSavedAddresses) {
      setShowNewAddressForm(false);
      const chosen = user.addresses[selectedSavedAddrIndex] || user.addresses[0];
      if (chosen) {
        setFormData({
          fullName: chosen.fullName,
          email: user?.email || '',
          mobile: chosen.phone,
          address: chosen.address,
          city: chosen.city,
          state: chosen.state,
          pincode: chosen.pincode
        });
      }
    }
  };

  const [searchParams] = useSearchParams();
  const preferMethod = searchParams.get('preferMethod');
  const [paymentMethod, setPaymentMethod] = useState(preferMethod === 'cod' ? 'cod' : 'razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  // Demo Simulation Modal State
  const [showRazorpayTestModal, setShowRazorpayTestModal] = useState(false);
  const [pendingOrderPayload, setPendingOrderPayload] = useState(null);
  const [demoOrderInfo, setDemoOrderInfo] = useState(null);

  // Fetch public payment config (Key ID only, no secret!)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await paymentAPI.getConfig();
        if (res.data.success) {
          setPaymentConfig(res.data);
        }
      } catch (err) {
        console.error('Failed to load payment config', err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const { data } = await couponAPI.getAvailable();
        if (data?.success) {
          setAvailableCoupons(data.coupons || []);
        }
      } catch (err) {
        console.error('Failed to load checkout coupons', err);
      } finally {
        setLoadingCoupons(false);
      }
    };

    loadCoupons();
  }, []);

  // Protect Checkout route: require user to be signed in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      info('Please sign in to proceed with your order.');
      navigate('/login?redirect=/checkout', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!authLoading && isAuthenticated && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [authLoading, isAuthenticated, cartItems, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Dynamically load Razorpay SDK script if needed
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const payableTotal = Math.max(0, total - discountAmount);
  const visibleCoupons = showAllCoupons ? availableCoupons : availableCoupons.slice(0, 2);

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

  // Handle Demo Mode Successful Payment Simulation
  const handleSimulateDemoSuccess = async () => {
    if (!pendingOrderPayload || !demoOrderInfo) return;
    setIsProcessing(true);
    try {
      const demoPaymentId = `pay_demo_${Date.now()}`;
      
      // Call backend payment verification
      await paymentAPI.verify({
        razorpayOrderId: demoOrderInfo.orderId,
        razorpayPaymentId: demoPaymentId,
        razorpaySignature: 'sig_demo_verified'
      });

      const finalOrder = await orderAPI.create({
        items: pendingOrderPayload.items,
        shippingAddress: pendingOrderPayload.shippingAddress,
        paymentMethod: 'razorpay',
        paymentStatus: 'completed',
        razorpayOrderId: demoOrderInfo.orderId,
        razorpayPaymentId: demoPaymentId,
        couponCode: pendingOrderPayload.couponCode
      });

      clearCart();
      setShowRazorpayTestModal(false);
      success('Payment verified! Order placed successfully.');
      navigate(`/order-confirmation/${finalOrder.data.order.orderId || finalOrder.data.order._id}?payment=success`);
    } catch (err) {
      console.error('Demo payment error', err);
      setShowRazorpayTestModal(false);
      navigate(`/payment-failed?reason=${encodeURIComponent(err.message || 'Payment processing error')}&amount=${payableTotal}&orderId=${demoOrderInfo.orderId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Determine active shipping address
    let activeAddress = null;

    if (!showNewAddressForm && hasSavedAddresses) {
      const selectedAddr = user.addresses[selectedSavedAddrIndex] || user.addresses[0];
      if (!selectedAddr) {
        error('Please select a saved delivery address.');
        return;
      }
      activeAddress = {
        fullName: selectedAddr.fullName,
        mobile: selectedAddr.phone,
        email: user?.email || formData.email || '',
        address: selectedAddr.address,
        city: selectedAddr.city,
        state: selectedAddr.state,
        pincode: selectedAddr.pincode
      };
    } else {
      // Validate new address form
      if (!formData.fullName?.trim() || !formData.mobile?.trim() || !formData.address?.trim() || !formData.pincode?.trim() || !formData.city?.trim() || !formData.state?.trim()) {
        error('Please fill in all required delivery address fields.');
        return;
      }

      if (!formData.mobile.trim().match(/^[0-9]{10}$/)) {
        error('Please enter a valid 10-digit mobile number.');
        return;
      }

      if (!formData.pincode.trim().match(/^[0-9]{6}$/)) {
        error('Please enter a valid 6-digit PIN code.');
        return;
      }

      activeAddress = {
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email?.trim() || user?.email || '',
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim()
      };

      // If user is logged in and elected to save this address to their profile
      if (isAuthenticated && saveAddressToAccount && updateProfile) {
        try {
          const currentAddresses = user.addresses || [];
          const newAddrRecord = {
            fullName: activeAddress.fullName,
            phone: activeAddress.mobile,
            address: activeAddress.address,
            city: activeAddress.city,
            state: activeAddress.state,
            pincode: activeAddress.pincode,
            isDefault: Boolean(setAsDefaultOnSave || currentAddresses.length === 0)
          };
          const updated = setAsDefaultOnSave
            ? currentAddresses.map((a) => ({ ...a, isDefault: false })).concat(newAddrRecord)
            : [...currentAddresses, newAddrRecord];

          await updateProfile({ addresses: updated });
        } catch (profileErr) {
          console.error('Failed to auto-save new address to profile', profileErr);
        }
      }
    }

    setIsProcessing(true);

    try {
      // 1. If Cash On Delivery
      if (paymentMethod === 'cod') {
        const orderPayload = {
          items: cartItems.map((item) => ({
            product: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            weight: item.weight,
            quantity: item.quantity,
            subtotal: item.subtotal
          })),
          shippingAddress: activeAddress,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          couponCode: appliedCoupon || undefined
        };

        const res = await orderAPI.create(orderPayload);
        if (res.data.success) {
          clearCart();
          success('Order placed successfully via Cash on Delivery!');
          navigate(`/order-confirmation/${res.data.order.orderId || res.data.order._id}?method=cod`);
          return;
        }
      }

      // 2. Razorpay Payment Flow
      const isScriptLoaded = await loadRazorpayScript();
      
      // Request payment order from backend
      const paymentOrderRes = await paymentAPI.createOrder({
        amount: payableTotal,
        receipt: `receipt_${Date.now()}`
      });

      if (!paymentOrderRes.data.success) {
        throw new Error('Failed to initiate payment gateway order.');
      }

      const { orderId, amount, currency, keyId, isDemo } = paymentOrderRes.data;

      // Real live/active Razorpay modal
      if (window.Razorpay && !isDemo) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: 'Mithila Makhana',
          description: 'Authentic Bihar Fox Nuts Order',
          order_id: orderId,
          handler: async function (response) {
            setIsProcessing(true);
            try {
              // Verify payment on backend
              const verifyRes = await paymentAPI.verify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });

              if (verifyRes.data.success) {
                const finalOrder = await orderAPI.create({
                  items: cartItems.map((item) => ({
                    product: item.id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    weight: item.weight,
                    quantity: item.quantity,
                    subtotal: item.subtotal
                  })),
                  shippingAddress: activeAddress,
                  paymentMethod: 'razorpay',
                  paymentStatus: 'completed',
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  couponCode: appliedCoupon || undefined
                });

                clearCart();
                success('Payment verified! Order placed successfully.');
                navigate(`/order-confirmation/${finalOrder.data.order.orderId || finalOrder.data.order._id}?payment=success`);
              } else {
                navigate(`/payment-failed?reason=Payment+signature+verification+mismatch&amount=${payableTotal}&orderId=${orderId}`);
              }
            } catch (vErr) {
              console.error('Payment verification failed:', vErr);
              navigate(`/payment-failed?reason=${encodeURIComponent(vErr.response?.data?.message || vErr.message || 'Payment verification failed')}&amount=${payableTotal}&orderId=${orderId}`);
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              info('Payment window closed. You can retry payment or choose Cash on Delivery.');
            }
          },
          prefill: {
            name: activeAddress.fullName,
            email: activeAddress.email || user?.email || '',
            contact: (activeAddress.mobile || '').replace(/\D/g, '').slice(-10)
          },
          theme: {
            color: '#4A2E1B'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (res) {
          setIsProcessing(false);
          navigate(`/payment-failed?reason=${encodeURIComponent(res.error?.description || 'Payment declined by bank')}&code=${res.error?.code || 'PAYMENT_FAILED'}&amount=${payableTotal}&orderId=${orderId}`);
        });
        razorpay.open();
      } else {
        // Test / Demo Mode: Launch Interactive Razorpay Test Modal
        setIsProcessing(false);
        setPendingOrderPayload({
          items: cartItems.map((item) => ({
            product: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            weight: item.weight,
            quantity: item.quantity,
            subtotal: item.subtotal
          })),
          shippingAddress: activeAddress,
          couponCode: appliedCoupon || undefined
        });
        setDemoOrderInfo({ orderId, amount, currency });
        setShowRazorpayTestModal(true);
      }

    } catch (err) {
      console.error('Checkout error', err);
      error(err.response?.data?.message || err.message || 'Checkout error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#D99B26] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#4A2E1B]">Redirecting to Sign In...</h2>
        <p className="text-xs text-[#8A6D56]">Please sign in to complete your checkout and place your order.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Title */}
      <div className="border-b border-[#E8DEC9] pb-4">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B]">
          Secure Checkout
        </h1>
        <p className="text-xs text-[#8A6D56] mt-1">
          Complete your delivery details to receive freshly roasted Mithila makhana.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Shipping Details & Payment Options */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Customer Information & Shipping Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#4A2E1B] text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="font-serif text-xl font-bold text-[#4A2E1B]">
                  Delivery Address
                </h2>
              </div>

              {hasSavedAddresses && !showNewAddressForm && (
                <button
                  type="button"
                  onClick={handleOpenNewAddressForm}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] hover:bg-[#27170E] text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D99B26]" />
                  <span>+ Add New Address</span>
                </button>
              )}
            </div>

            {/* View A: Saved Addresses Display (shown when user has saved addresses and form is hidden) */}
            {hasSavedAddresses && !showNewAddressForm && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4A2E1B]">
                    Choose Delivery Destination ({user.addresses.length} saved):
                  </span>
                  <Link
                    to="/profile"
                    className="text-[11px] text-[#8A6D56] hover:text-[#4A2E1B] inline-flex items-center space-x-1 font-semibold hover:underline"
                  >
                    <span>Manage Addresses</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.addresses.map((addr, idx) => {
                    const isSelected = selectedSavedAddrIndex === idx;
                    const isDefault = Boolean(addr.isDefault);

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectSavedAddress(addr, idx)}
                        className={`p-4 rounded-2xl border text-xs transition-all cursor-pointer flex flex-col justify-between relative ${
                          isSelected
                            ? 'border-[#4A2E1B] bg-[#FEF8EA]/50 ring-2 ring-[#4A2E1B] shadow-sm'
                            : 'border-[#E8DEC9] bg-[#FAF6F0]/40 hover:bg-[#FAF6F0] hover:border-[#D99B26]/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-[#4A2E1B] bg-[#4A2E1B]' : 'border-gray-300'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="font-bold text-sm text-[#4A2E1B]">{addr.fullName}</span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {isDefault && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20 flex items-center space-x-1">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>Default</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1 text-[#6D4A32] pl-6 text-xs">
                            <p className="line-clamp-2">{addr.address}</p>
                            <p className="font-medium">{addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span></p>
                            <p className="text-[11px] text-[#8A6D56] pt-1">
                              Mobile: <span className="font-semibold text-[#4A2E1B]">{addr.phone}</span>
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-3 pt-2.5 border-t border-[#4A2E1B]/15 flex items-center justify-between text-[11px] text-[#2D5A27] font-bold">
                            <span className="flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Delivering to this address</span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Additional Quick Add Address Banner / Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleOpenNewAddressForm}
                    className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#D99B26]/60 bg-[#FEF8EA]/30 hover:bg-[#FEF8EA] text-[#4A2E1B] text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer group"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#D99B26] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span>+ Add New Address</span>
                  </button>
                </div>
              </div>
            )}

            {/* View B: Address Form (Opened when user clicks "+ Add New Address" OR if no saved addresses exist) */}
            {showNewAddressForm && (
              <div className="space-y-4">
                {hasSavedAddresses ? (
                  <div className="flex items-center justify-between bg-[#FEF8EA] border border-[#D99B26]/30 p-3.5 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-[#D99B26] text-white flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#4A2E1B]">Adding New Delivery Address</p>
                        <p className="text-[11px] text-[#8A6D56]">Fill in details for this delivery</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelNewAddress}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#8A6D56] hover:text-[#4A2E1B] bg-white px-3 py-1.5 rounded-xl border border-[#E8DEC9] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel / Use Saved</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#8A6D56]">
                    Please provide your delivery details below to receive your freshly packed makhana.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                      Recipient Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                      required={showNewAddressForm}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                      Mobile Number (10 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="e.g. 9812345678"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                      required={showNewAddressForm}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                      Street Address / House No. / Landmark <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Flat 101, Mithila Apartments, Near Station Road"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                      required={showNewAddressForm}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                      City / Town <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Darbhanga"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                      required={showNewAddressForm}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                      PIN Code (6 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 846004"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                      required={showNewAddressForm}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Bihar"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                      required={showNewAddressForm}
                    />
                  </div>

                  {isAuthenticated && (
                    <div className="sm:col-span-2 pt-3 space-y-2 border-t border-[#E8DEC9]">
                      <label className="flex items-center space-x-2 cursor-pointer text-xs text-[#4A2E1B]">
                        <input
                          type="checkbox"
                          checked={saveAddressToAccount}
                          onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                          className="rounded border-[#E8DEC9] text-[#4A2E1B] focus:ring-[#D99B26]"
                        />
                        <span className="font-semibold">Save this address to my profile for future orders</span>
                      </label>

                      {saveAddressToAccount && (
                        <label className="flex items-center space-x-2 cursor-pointer text-xs text-[#4A2E1B] pl-5">
                          <input
                            type="checkbox"
                            checked={setAsDefaultOnSave}
                            onChange={(e) => setSetAsDefaultOnSave(e.target.checked)}
                            className="rounded border-[#E8DEC9] text-[#2D5A27] focus:ring-[#2D5A27]"
                          />
                          <span className="text-[#6D4A32]">Make this my default shipping address</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-6">
            <div className="flex items-center space-x-2 border-b border-[#E8DEC9] pb-3">
              <div className="w-6 h-6 rounded-full bg-[#4A2E1B] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="font-serif text-xl font-bold text-[#4A2E1B]">
                Payment Option
              </h2>
            </div>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label
                className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#4A2E1B] bg-[#FAF6F0]'
                    : 'border-[#E8DEC9] hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-[#4A2E1B] focus:ring-[#D99B26]"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#4A2E1B]">
                      Online Payment (UPI, Cards, Netbanking via Razorpay)
                    </span>
                    <span className="text-[10px] bg-[#2D5A27] text-white font-bold px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-[#8A6D56] mt-1">
                    Instant & secure checkout powered by Razorpay payment gateway architecture.
                  </p>
                </div>
              </label>

              {/* Cash On Delivery */}
              <label
                className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#4A2E1B] bg-[#FAF6F0]'
                    : 'border-[#E8DEC9] hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-[#4A2E1B] focus:ring-[#D99B26]"
                />
                <div className="ml-3 flex-1">
                  <span className="font-bold text-sm text-[#4A2E1B]">
                    Cash on Delivery (COD)
                  </span>
                  <p className="text-xs text-[#8A6D56] mt-1">
                    Pay with cash or UPI at your doorstep upon package arrival.
                  </p>
                </div>
              </label>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[11px] text-[#6D4A32] flex items-center space-x-2">
              <Lock className="w-4 h-4 text-[#2D5A27] flex-shrink-0" />
              <span>All payment transmissions are 256-bit SSL encrypted. No card or secret keys stored.</span>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary Preview & Submit */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#4A2E1B] border-b border-[#E8DEC9] pb-3">
            Review Order ({cartItems.length} items)
          </h3>

          {/* Mini Item List */}
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-none">
            {cartItems.map((item) => (
              <div key={`${item.id}_${item.weight}`} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#E8DEC9] flex-shrink-0"
                  />
                  <div>
                    <p className="font-bold text-[#4A2E1B] line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-[#8A6D56]">
                      {item.weight} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-[#4A2E1B]">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          {/* Coupons & Offers */}
          <div className="border-t border-[#E8DEC9] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#4A2E1B] flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>Coupons & Offers</span>
              </label>
              {availableCoupons.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllCoupons(!showAllCoupons)}
                  className="text-[10px] font-bold text-[#D99B26] hover:text-[#4A2E1B] transition-colors"
                >
                  {showAllCoupons ? 'Show Less' : `View All Coupons (${availableCoupons.length})`}
                </button>
              )}
            </div>

            {!loadingCoupons && availableCoupons.length > 0 ? (
              <div className="space-y-2">
                {visibleCoupons.map((coupon) => {
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
            ) : (
              !loadingCoupons && (
                <p className="text-[10px] text-[#8A6D56] bg-[#FAF6F0] rounded-xl border border-[#E8DEC9] p-3">
                  No coupon offers are available right now.
                </p>
              )
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
                  {applyingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
              <p className="text-[10px] text-[#8A6D56]">Choose an offer above or enter a valid promo code.</p>
            </form>
          </div>

          {/* Cost Breakdown */}
          <div className="border-t border-[#E8DEC9] pt-4 space-y-2.5 text-xs text-[#6D4A32]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#4A2E1B]">₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Standard Shipping</span>
              {shippingFee === 0 ? (
                <span className="font-bold text-[#2D5A27]">FREE (Above ₹{freeShippingThreshold})</span>
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
              <span>Amount Payable</span>
              <span className="text-2xl text-[#4A2E1B]">₹{payableTotal}</span>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] disabled:bg-gray-400 text-[#FAF6F0] font-bold text-sm shadow-card flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Complete Order • ₹{payableTotal}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-[#8A6D56]">
            By placing an order, you agree to Mithila Makhana's Terms of Service and Privacy Policy.
          </p>

        </div>

      </form>

      {/* Razorpay Test Modal (For demo / test environment) */}
      {showRazorpayTestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#E8DEC9] shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header with Razorpay Logo / Badge */}
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0C2340] text-white flex items-center justify-center font-bold text-xs tracking-wider">
                  RZP
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0C2340]">Razorpay Secure Gateway</h3>
                  <p className="text-[11px] text-[#8A6D56]">Demo / Test Payment Environment</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRazorpayTestModal(false);
                  navigate(`/payment-failed?reason=Payment+window+cancelled+by+user&amount=${payableTotal}&orderId=${demoOrderInfo?.orderId || ''}`);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount & Order details */}
            <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#E8DEC9] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#8A6D56]">
                <span>Payable Amount:</span>
                <span className="font-serif text-2xl font-bold text-[#4A2E1B]">₹{payableTotal}</span>
              </div>
              <div className="flex items-center justify-between text-[#8A6D56] pt-1 border-t border-[#E8DEC9]">
                <span>Merchant:</span>
                <span className="font-semibold text-[#4A2E1B]">Mithila Makhana</span>
              </div>
              <div className="flex items-center justify-between text-[#8A6D56]">
                <span>Gateway Order:</span>
                <span className="font-mono text-[11px] text-[#4A2E1B]">{demoOrderInfo?.orderId}</span>
              </div>
            </div>

            {/* Instructional note */}
            <p className="text-xs text-[#6D4A32] text-center">
              Select an outcome below to test both the payment success and failure flows:
            </p>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSimulateDemoSuccess}
                className="w-full py-3.5 px-4 rounded-xl bg-[#2D5A27] hover:bg-[#1E3E1A] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#D99B26]" />
                )}
                <span>Simulate Payment Success (UPI / Card)</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setShowRazorpayTestModal(false);
                  navigate(`/payment-failed?reason=Transaction+declined+by+bank+(Test+Simulation)&amount=${payableTotal}&orderId=${demoOrderInfo?.orderId || ''}`);
                }}
                className="w-full py-3 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Simulate Payment Failure (Bank Decline)</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setShowRazorpayTestModal(false);
                  navigate(`/payment-failed?reason=Payment+cancelled+by+user&amount=${payableTotal}&orderId=${demoOrderInfo?.orderId || ''}`);
                }}
                className="w-full py-2 text-xs text-[#8A6D56] hover:text-[#4A2E1B] font-semibold transition-colors"
              >
                Cancel Transaction
              </button>
            </div>

            <div className="text-[10px] text-center text-[#8A6D56] flex items-center justify-center space-x-1">
              <Lock className="w-3 h-3 text-[#2D5A27]" />
              <span>Secured with 256-bit test encryption</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
