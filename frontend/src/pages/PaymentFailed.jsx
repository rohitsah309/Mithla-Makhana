import React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  XCircle, 
  RefreshCw, 
  Truck, 
  ArrowLeft, 
  HelpCircle, 
  ShieldAlert, 
  ShoppingBag,
  PhoneCall
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const reason = searchParams.get('reason') || 'Transaction was declined or cancelled by the user.';
  const amount = searchParams.get('amount') || '';
  const orderId = searchParams.get('orderId') || '';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      {/* Main Alert Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-red-200/80 shadow-soft text-center space-y-6 relative overflow-hidden">
        
        {/* Subtle decorative accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-50 rounded-full blur-2xl pointer-events-none" />

        {/* Failure Icon */}
        <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center border-4 border-red-100 shadow-inner">
          <XCircle className="w-12 h-12" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Payment Unsuccessful
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B] pt-2">
            Payment Could Not Be Completed
          </h1>
          <p className="text-sm text-[#8A6D56] max-w-lg mx-auto">
            Your transaction was not completed. Don't worry, your cart items are still saved and no money has been charged.
          </p>
        </div>

        {/* Reason Box */}
        <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#E8DEC9] text-left max-w-md mx-auto space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-[#4A2E1B] font-bold">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Transaction Details:</span>
          </div>
          <div className="text-[#6D4A32] space-y-1 pl-6">
            <p><span className="font-medium text-[#8A6D56]">Reason:</span> {reason}</p>
            {amount && (
              <p><span className="font-medium text-[#8A6D56]">Attempted Amount:</span> ₹{amount}</p>
            )}
            {orderId && (
              <p><span className="font-medium text-[#8A6D56]">Gateway Ref:</span> {orderId}</p>
            )}
          </div>
          <p className="text-[11px] text-[#8A6D56] pt-1 pl-6">
            If any funds were deducted by your bank, they will be automatically credited back within 3-5 working days.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-4 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-card cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#D99B26]" />
            <span>Retry Payment</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/checkout?preferMethod=cod')}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2D5A27] hover:bg-[#1E3E1A] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-card cursor-pointer"
          >
            <Truck className="w-4 h-4 text-[#D99B26]" />
            <span>Pay via Cash on Delivery</span>
          </button>
        </div>

        <div className="pt-2">
          <Link
            to="/cart"
            className="inline-flex items-center space-x-1.5 text-xs text-[#8A6D56] hover:text-[#4A2E1B] font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shopping Cart ({cartItems.length} items)</span>
          </Link>
        </div>

      </div>

      {/* Support Box */}
      <div className="bg-[#FAF6F0] rounded-2xl p-6 border border-[#E8DEC9] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-white text-[#D99B26] flex items-center justify-center shadow-xs flex-shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#4A2E1B]">Having trouble with payment?</h4>
            <p className="text-[#8A6D56]">Our family team is here to assist you with UPI, Cards, or doorstep delivery.</p>
          </div>
        </div>

        <Link
          to="/contact"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-[#E8DEC9] text-[#4A2E1B] font-bold hover:bg-[#FEF8EA] transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#2D5A27]" />
          <span>Contact Support</span>
        </Link>
      </div>

    </div>
  );
};

export default PaymentFailed;
