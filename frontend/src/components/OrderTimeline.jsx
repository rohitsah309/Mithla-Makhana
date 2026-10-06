import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle, 
  Box, 
  ShieldCheck, 
  Send 
} from 'lucide-react';

const STAGES = [
  { key: 'Order Placed', label: 'Order Placed', icon: Clock, desc: 'We have received your order' },
  { key: 'Confirmed', label: 'Confirmed', icon: ShieldCheck, desc: 'Payment and order verified' },
  { key: 'Processing', label: 'Processing', icon: Package, desc: 'Batch freshly selected' },
  { key: 'Packed', label: 'Packed', icon: Box, desc: 'Sealed in moisture-proof barrier pouches' },
  { key: 'Shipped', label: 'Shipped', icon: Send, desc: 'Handed over to express courier' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, desc: 'Arriving at your doorstep soon' },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle, desc: 'Handed to customer safely' }
];

const OrderTimeline = ({ currentStatus = 'Order Placed', statusHistory = [] }) => {
  const currentIndex = STAGES.findIndex(
    (s) => s.key.toLowerCase() === currentStatus.toLowerCase()
  );
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  const getHistoryForStage = (stageKey) => {
    return statusHistory.find((h) => h.status.toLowerCase() === stageKey.toLowerCase());
  };

  return (
    <div className="w-full py-6">
      {/* Mobile Vertical View */}
      <div className="md:hidden flex flex-col space-y-6 relative pl-6 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8DEC9]">
        {STAGES.map((stage, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = stage.icon;
          const historyEntry = getHistoryForStage(stage.key);

          return (
            <div key={stage.key} className="relative flex items-start space-x-3.5">
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-[#D99B26] text-white ring-4 ring-[#D99B26]/20'
                    : isDone
                    ? 'bg-[#2D5A27] text-white'
                    : 'bg-white border-2 border-[#E8DEC9] text-gray-300'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
              </div>

              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <h4 className={`text-sm font-bold ${isDone ? 'text-[#4A2E1B]' : 'text-gray-400'}`}>
                    {stage.label}
                  </h4>
                  {historyEntry && (
                    <span className="text-[10px] text-[#8A6D56]">
                      {new Date(historyEntry.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6D4A32] mt-0.5">{stage.desc}</p>
                {historyEntry?.notes && (
                  <p className="text-[11px] italic text-[#8A6D56] mt-0.5">"{historyEntry.notes}"</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Horizontal View */}
      <div className="hidden md:block">
        <div className="relative flex items-center justify-between">
          {/* Background Connecting Line */}
          <div className="absolute top-5 left-6 right-6 h-1 bg-[#E8DEC9] -z-0" />
          {/* Active Highlight Line */}
          <div
            className="absolute top-5 left-6 h-1 bg-[#2D5A27] transition-all duration-700 -z-0"
            style={{
              width: `${(activeIndex / (STAGES.length - 1)) * 90}%`
            }}
          />

          {STAGES.map((stage, idx) => {
            const isDone = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = stage.icon;
            const historyEntry = getHistoryForStage(stage.key);

            return (
              <div key={stage.key} className="flex flex-col items-center relative z-10 text-center max-w-[90px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-[#D99B26] text-white ring-4 ring-[#D99B26]/20 scale-110 shadow-md'
                      : isDone
                      ? 'bg-[#2D5A27] text-white shadow-sm'
                      : 'bg-white border-2 border-[#E8DEC9] text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span
                  className={`mt-2.5 text-xs font-bold leading-tight ${
                    isDone ? 'text-[#4A2E1B]' : 'text-gray-400'
                  }`}
                >
                  {stage.label}
                </span>

                {historyEntry && (
                  <span className="text-[10px] text-[#8A6D56] mt-0.5">
                    {new Date(historyEntry.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
