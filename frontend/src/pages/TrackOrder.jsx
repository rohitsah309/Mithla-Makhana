import React, { useState } from 'react';
import { Search, Package, ArrowRight, Truck, CheckCircle2, Clock } from 'lucide-react';
import { orderAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import OrderTimeline from '../components/OrderTimeline';

const TrackOrder = () => {
  const [orderQuery, setOrderQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { error } = useToast();

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await orderAPI.getById(orderQuery.trim());
      if (res.data.success) {
        setSearchedOrder(res.data.order);
      }
    } catch (err) {
      setSearchedOrder(null);
      error(err.response?.data?.message || 'Order reference not found. Please double-check your order ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Title & Lookup Form */}
      <div className="bg-hero-gradient rounded-3xl p-8 sm:p-12 border border-[#E8DEC9] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-white text-[#D99B26] mx-auto flex items-center justify-center shadow-soft">
          <Truck className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-lg mx-auto">
          <span className="text-xs uppercase tracking-widest text-[#D99B26] font-bold">
            Live Dispatch Tracking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2E1B]">
            Track Your Makhana Order
          </h1>
          <p className="text-xs sm:text-sm text-[#6D4A32]">
            Enter your order reference (e.g. <span className="font-bold text-[#4A2E1B]">MM-2026-7841</span>) to view its real-time packing, shipping, and delivery journey.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTrackSubmit} className="max-w-md mx-auto flex items-center bg-white p-2 rounded-2xl border border-[#E8DEC9] shadow-soft">
          <input
            type="text"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Enter Order ID (e.g. MM-2026-7841)..."
            className="flex-1 px-4 py-2 text-xs text-[#4A2E1B] placeholder-[#8A6D56] bg-transparent focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            {loading ? (
              <span>Tracking...</span>
            ) : (
              <>
                <span>Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-[#8A6D56]">
          Tip: You can try sample order ID: <span className="font-bold text-[#D99B26] cursor-pointer" onClick={() => setOrderQuery('MM-2026-7841')}>MM-2026-7841</span>
        </p>
      </div>

      {/* Result Section */}
      {searchedOrder && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DEC9] shadow-soft space-y-8 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8DEC9] pb-4 gap-2">
            <div>
              <span className="text-xs text-[#8A6D56]">Order Reference</span>
              <h3 className="font-serif text-2xl font-bold text-[#4A2E1B]">
                #{searchedOrder.orderId}
              </h3>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#E8DEC9] font-medium text-[#6D4A32]">
                Placed: {new Date(searchedOrder.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-[#EAF3E7] text-[#2D5A27] font-bold border border-[#2D5A27]/20">
                {searchedOrder.orderStatus}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A2E1B] mb-2">
              Progression Timeline
            </h4>
            <OrderTimeline
              currentStatus={searchedOrder.orderStatus}
              statusHistory={searchedOrder.statusHistory || []}
            />
          </div>

          {/* Items & Shipping preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E8DEC9]">
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A2E1B]">
                Items In Package ({searchedOrder.items?.length})
              </h4>
              <div className="space-y-2">
                {searchedOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#FAF6F0]">
                    <span className="font-medium text-[#4A2E1B]">{it.name} ({it.weight}) × {it.quantity}</span>
                    <span className="font-bold text-[#4A2E1B]">₹{it.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#6D4A32] bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DEC9]">
              <h4 className="font-bold uppercase tracking-wider text-[#4A2E1B] mb-1">
                Destination
              </h4>
              <p className="font-semibold text-[#4A2E1B]">{searchedOrder.shippingAddress?.fullName}</p>
              <p>{searchedOrder.shippingAddress?.address}, {searchedOrder.shippingAddress?.city}</p>
              <p>{searchedOrder.shippingAddress?.state} - {searchedOrder.shippingAddress?.pincode}</p>
              <p className="pt-1 text-[#8A6D56]">Contact: {searchedOrder.shippingAddress?.mobile}</p>
            </div>
          </div>

        </div>
      )}

      {hasSearched && !loading && !searchedOrder && (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E8DEC9] space-y-3">
          <Clock className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">No Matching Order Found</h3>
          <p className="text-xs text-[#8A6D56] max-w-sm mx-auto">
            Please verify the order reference number from your confirmation email or SMS.
          </p>
        </div>
      )}

    </div>
  );
};

export default TrackOrder;
