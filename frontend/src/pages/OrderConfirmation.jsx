import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  Truck, 
  MapPin, 
  Calendar, 
  Share2, 
  Sparkles,
  FileText,
  Printer,
  Copy,
  Check,
  CreditCard,
  Building2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { orderAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import OrderTimeline from '../components/OrderTimeline';
import InvoiceView from '../components/InvoiceView';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const { success, info } = useToast();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getById(orderId);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    window.scrollTo(0, 0);
  }, [orderId]);

  const handleCopyOrderNumber = () => {
    const idToCopy = order?.orderId || order?._id || orderId;
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    success(`Order number #${idToCopy} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#D99B26] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[#8A6D56]">Confirming your order details and invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-[#4A2E1B]">Order Not Found</h2>
        <p className="text-xs text-[#8A6D56]">We could not locate order details for "#{orderId}".</p>
        <Link to="/shop" className="inline-flex px-6 py-2.5 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] text-xs font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isRazorpay = order.paymentMethod === 'razorpay' || order.paymentStatus === 'completed';
  const displayOrderId = order.orderId || order._id;
  const invoiceNumber = order.invoiceNumber || `INV-${displayOrderId.replace('MM-', '')}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. Main Celebration & Order Placed Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DEC9] shadow-soft text-center space-y-5 relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FEF8EA] rounded-full blur-2xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#EAF3E7] text-[#2D5A27] mx-auto flex items-center justify-center border-4 border-[#EAF3E7] shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Status Badge */}
        <div>
          {isRazorpay ? (
            <span className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-widest text-[#2D5A27] bg-[#EAF3E7] px-3.5 py-1 rounded-full border border-[#2D5A27]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Payment Verified • Order Placed Successfully</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-widest text-[#B07812] bg-[#FEF8EA] px-3.5 py-1 rounded-full border border-[#D99B26]/30">
              <Truck className="w-3.5 h-3.5" />
              <span>Cash on Delivery • Order Placed Successfully</span>
            </span>
          )}
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B]">
            {isRazorpay ? 'Payment & Order Successful!' : 'Order Confirmed via Cash on Delivery!'}
          </h1>
          <p className="text-sm text-[#6D4A32] max-w-lg mx-auto">
            {isRazorpay ? (
              <>Your online payment of <strong className="text-[#4A2E1B]">₹{order.total}</strong> has been received via Razorpay. We are hand-packing your authentic Mithila fox nuts.</>
            ) : (
              <>Your order is confirmed. Please keep <strong className="text-[#4A2E1B]">₹{order.total}</strong> ready in cash or UPI when your delivery agent arrives.</>
            )}
          </p>
        </div>

        {/* Prominent Order Number Display Box */}
        <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#E8DEC9] max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6D56]">
              Official Order Reference Number:
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-2xl text-[#4A2E1B] tracking-wide">
                #{displayOrderId}
              </span>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                title="Copy Order Number"
                className="p-1.5 rounded-lg bg-white hover:bg-gray-100 border border-[#E8DEC9] text-[#6D4A32] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#2D5A27]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#8A6D56]">Invoice Reference: <span className="font-semibold text-[#4A2E1B]">{invoiceNumber}</span></p>
          </div>

          {/* Action Buttons: View Invoice & Print Invoice */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-white text-[#4A2E1B] border border-[#E8DEC9] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#D99B26]" />
              <span>View Invoice</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowInvoiceModal(true);
                setTimeout(() => window.print(), 350);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D99B26]" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Delivery Timeline info */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#FAF6F0] border border-[#E8DEC9] text-xs text-[#4A2E1B] font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#D99B26]" />
            <span>Dispatch: Within 24-48 Hours</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#FAF6F0] border border-[#E8DEC9] text-xs text-[#4A2E1B] font-semibold">
            <Truck className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>Delivery: 3-5 Working Days</span>
          </span>
        </div>
      </div>

      {/* 2. Live Order Status Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DEC9] shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-[#4A2E1B]" />
            <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">
              Order Status Tracking
            </h3>
          </div>
          <span className="text-xs bg-[#FEF8EA] text-[#B07812] font-bold px-3 py-1 rounded-full border border-[#D99B26]/30">
            {order.orderStatus}
          </span>
        </div>

        <OrderTimeline currentStatus={order.orderStatus} statusHistory={order.statusHistory || []} />
      </div>

      {/* 3. Purchased Products & Delivery Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Purchased Items List */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">
              Purchased Products ({order.items?.length || 0})
            </h3>
            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="text-xs font-bold text-[#2D5A27] hover:underline inline-flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download Tax Invoice</span>
            </button>
          </div>

          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#E8DEC9] bg-[#FAF6F0]"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#4A2E1B]">{item.name}</h4>
                    <p className="text-[11px] text-[#8A6D56]">
                      Pack: {item.weight} • Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#4A2E1B]">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8DEC9] space-y-1.5 text-xs text-[#6D4A32]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#4A2E1B]">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (5% Included):</span>
              <span>₹{(order.subtotal * 0.05).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-[#2D5A27]">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#4A2E1B] pt-2 border-t border-gray-100">
              <span>Total {isRazorpay ? 'Paid' : 'Payable on Delivery'}:</span>
              <span className="text-xl">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Shipping Destination & Payment Method */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-5">
          <h3 className="font-serif text-lg font-bold text-[#4A2E1B] border-b border-[#E8DEC9] pb-3">
            Delivery Destination
          </h3>

          <div className="space-y-2 text-xs text-[#6D4A32]">
            <p className="font-bold text-sm text-[#4A2E1B]">{order.shippingAddress?.fullName || order.customer?.name}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p className="pt-2 text-[#8A6D56]">Phone: {order.shippingAddress?.mobile || order.customer?.phone}</p>
            {order.shippingAddress?.email && (
              <p className="text-[#8A6D56]">Email: {order.shippingAddress?.email}</p>
            )}
          </div>

          <div className="pt-3 border-t border-[#E8DEC9] text-xs space-y-2">
            <span className="font-bold text-[#4A2E1B] block">Payment Summary:</span>
            <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#8A6D56]">Method:</span>
                <span className="font-bold text-[#4A2E1B]">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay (Online Prepaid)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A6D56]">Status:</span>
                <span className={`font-bold ${isRazorpay ? 'text-[#2D5A27]' : 'text-[#B07812]'}`}>
                  {isRazorpay ? 'Paid Fully' : 'Pending on Doorstep'}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200">
                  <span className="text-[#8A6D56]">Payment ID:</span>
                  <span className="font-mono text-[#4A2E1B]">{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => {
                setShowInvoiceModal(true);
                setTimeout(() => window.print(), 350);
              }}
              className="w-full py-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-center font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#D99B26]" />
              <span>Print Tax Invoice (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="w-full py-2.5 rounded-xl border border-[#4A2E1B] text-[#4A2E1B] text-center font-bold text-xs hover:bg-[#FAF6F0] transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-[#4A2E1B]" />
              <span>View Full Invoice Preview</span>
            </button>

            <Link
              to="/shop"
              className="w-full py-2.5 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] text-center font-bold text-xs hover:bg-[#27170E] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>

      {/* 4. Full Invoice Modal View */}
      {showInvoiceModal && (
        <InvoiceView order={order} onClose={() => setShowInvoiceModal(false)} />
      )}

    </div>
  );
};

export default OrderConfirmation;
