import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  FileText,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

const InvoiceView = ({ order, onClose }) => {
  const { freeShippingThreshold } = useCart();

  if (!order) return null;

  // Default zoom to 88% so full invoice fits gracefully without overlapping screen edges
  const [zoom, setZoom] = useState(88);

  // Prevent background scrolling while invoice modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Allow Escape key to close modal
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const invoiceNo = order.invoiceNumber || `INV-${order.orderId ? order.orderId.replace('MM-', '') : '2026-8812'}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const isPrepaid = order.paymentStatus === 'completed' || order.paymentMethod === 'razorpay';

  // Format number into Indian words approximation
  const numberToWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const n = Math.floor(Number(num) || 0);
    if (n === 0) return 'Zero';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numberToWords(n % 100) : '');
    if (n < 100000) return numberToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numberToWords(n % 1000) : '');
    return num.toString();
  };

  const modalContent = (
    <div 
      id="invoice-modal-portal"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-sm flex flex-col items-center justify-start py-6 sm:py-8 px-3 sm:px-6"
      onClick={(e) => {
        if (e.target.id === 'invoice-modal-portal' && onClose) {
          onClose();
        }
      }}
    >
      
      {/* Exact Print Stylesheet */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm 10mm;
        }

        @media print {
          /* Completely hide entire React website tree from print flow */
          #root,
          nav,
          footer,
          header,
          .no-print {
            display: none !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #1a1a1a !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #invoice-modal-portal {
            display: block !important;
            position: static !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            backdrop-filter: none !important;
            overflow: visible !important;
            z-index: auto !important;
          }

          #invoice-scale-container {
            transform: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          #printable-invoice {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 1px solid #D1C7B7 !important;
            border-radius: 4px !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
          }

          #printable-invoice * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Floating Action Controls Bar (Screen Only) */}
      <div className="no-print w-full max-w-4xl bg-[#FAF6F0] rounded-2xl px-5 py-3 border border-[#E8DEC9] shadow-xl mb-4 flex flex-wrap items-center justify-between gap-3 sticky top-2 z-50">
        
        {/* Left: Title & Badge */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#D99B26]" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#4A2E1B] leading-none">
              Tax Invoice & Cash Memo
            </h3>
            <span className="text-[10px] text-[#8A6D56]">#{invoiceNo} • {orderDate}</span>
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div className="hidden sm:flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#E8DEC9] shadow-2xs">
          <span className="text-[10px] font-bold text-[#8A6D56] uppercase tracking-wider pr-1">Zoom:</span>
          
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(70, prev - 5))}
            title="Zoom Out"
            className="w-6 h-6 rounded-lg bg-[#FAF6F0] hover:bg-[#E8DEC9] text-[#4A2E1B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-mono font-bold text-[#4A2E1B] min-w-[36px] text-center">
            {zoom}%
          </span>

          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(115, prev + 5))}
            title="Zoom In"
            className="w-6 h-6 rounded-lg bg-[#FAF6F0] hover:bg-[#E8DEC9] text-[#4A2E1B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoom(88)}
            title="Reset Zoom to 88%"
            className="text-[10px] font-semibold text-[#8A6D56] hover:text-[#4A2E1B] pl-1 transition-colors flex items-center space-x-0.5 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Right: Print & Close Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D99B26]" />
            <span>Print Invoice</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-[#E8DEC9] text-[#4A2E1B] flex items-center justify-center transition-colors cursor-pointer"
              title="Close Invoice"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Invoice Document Wrapper with Responsive Zoom Scale */}
      <div 
        id="invoice-scale-container"
        className="w-full max-w-4xl transition-transform duration-150 origin-top"
        style={{
          transform: window.innerWidth > 640 ? `scale(${zoom / 100})` : 'none',
          marginBottom: window.innerWidth > 640 ? `${(zoom - 100) * 8}px` : '0px'
        }}
      >
        <div 
          id="printable-invoice"
          className="bg-white rounded-3xl w-full border border-[#E8DEC9] shadow-2xl overflow-hidden print:rounded-none"
        >
          
          {/* Invoice Document Body with tight print padding for single page fit */}
          <div className="p-6 sm:p-8 print:p-5 space-y-5 print:space-y-3.5 text-[#321F12]">
            
            {/* Header & Brand Details */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-[#4A2E1B] pb-4 print:pb-2.5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] flex items-center justify-center font-serif font-bold text-lg shadow-xs">
                    M
                  </div>
                  <div>
                    <h1 className="font-serif text-2xl font-bold tracking-tight text-[#4A2E1B] leading-none">
                      MITHILA MAKHANA
                    </h1>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#8A6D56] font-bold block pt-0.5">
                      Authentic Bihar Heritage Fox Nuts
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-[#6D4A32] pt-1.5 space-y-0.5 leading-tight">
                  <p>Station Road, Near Makhana Research Hub, Darbhanga, Bihar - 846004, India</p>
                  <p>Email: <span className="font-semibold text-[#4A2E1B]">support@mithilamakhana.com</span> • Tel: <span className="font-semibold text-[#4A2E1B]">+91 98765 43210</span></p>
                  <p className="text-[#8A6D56]">GSTIN: <span className="font-bold text-[#4A2E1B]">10AAAFM1234F1Z5</span> • FSSAI Lic. No: <span className="font-bold text-[#4A2E1B]">10424000000123</span></p>
                </div>
              </div>

              <div className="sm:text-right space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FAF6F0] border border-[#E8DEC9] text-[11px] font-bold text-[#4A2E1B] uppercase tracking-wider">
                  ORIGINAL TAX INVOICE
                </span>
                <div className="text-[11px] pt-1.5 space-y-0.5 text-[#6D4A32]">
                  <p><span className="text-[#8A6D56]">Invoice No:</span> <strong className="text-[#4A2E1B]">{invoiceNo}</strong></p>
                  <p><span className="text-[#8A6D56]">Invoice Date:</span> <strong className="text-[#4A2E1B]">{orderDate}</strong></p>
                  <p><span className="text-[#8A6D56]">Order ID:</span> <strong className="text-[#4A2E1B]">{order.orderId || order._id}</strong></p>
                  <p><span className="text-[#8A6D56]">Place of Supply:</span> <strong>Bihar (State Code: 10)</strong></p>
                </div>
              </div>
            </div>

            {/* Billed To & Payment Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-3 bg-[#FAF6F0]/80 p-4 print:p-3 print:py-2.5 rounded-2xl print:rounded-lg border border-[#E8DEC9]">
              
              {/* Customer Details */}
              <div className="space-y-1 text-xs">
                <span className="text-[9px] uppercase font-bold text-[#8A6D56] tracking-wider block">
                  Billed & Shipped To:
                </span>
                <h4 className="font-bold text-sm text-[#4A2E1B] leading-snug">
                  {order.shippingAddress?.fullName || order.customer?.name}
                </h4>
                <p className="text-[#6D4A32] leading-tight text-[11px]">
                  {order.shippingAddress?.address}
                </p>
                <p className="text-[#6D4A32] text-[11px]">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - <span className="font-bold text-[#4A2E1B]">{order.shippingAddress?.pincode}</span>
                </p>
                <p className="pt-0.5 text-[#6D4A32] text-[11px]">
                  Mobile: <strong className="text-[#4A2E1B]">{order.shippingAddress?.mobile || order.customer?.phone}</strong>
                </p>
                {order.shippingAddress?.email && (
                  <p className="text-[#6D4A32] text-[11px]">Email: {order.shippingAddress.email}</p>
                )}
              </div>

              {/* Payment & Dispatch Status */}
              <div className="space-y-1.5 text-xs sm:border-l sm:border-[#E8DEC9] sm:pl-4 print:pl-3">
                <span className="text-[9px] uppercase font-bold text-[#8A6D56] tracking-wider block">
                  Payment & Fulfillment Details:
                </span>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8A6D56]">Payment Method:</span>
                    <strong className="text-[#4A2E1B] uppercase">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay (Online Payment)'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8A6D56]">Payment Status:</span>
                    {isPrepaid ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#EAF3E7] text-[#2D5A27] font-bold text-[10px] border border-[#2D5A27]/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PAID FULLY</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#FEF8EA] text-[#B07812] font-bold text-[10px] border border-[#D99B26]/30">
                        <Clock className="w-3 h-3" />
                        <span>DUE ON DELIVERY</span>
                      </span>
                    )}
                  </div>

                  {order.razorpayPaymentId && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8A6D56]">Razorpay Txn ID:</span>
                      <span className="font-mono text-[#4A2E1B] font-semibold">{order.razorpayPaymentId}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-0.5 border-t border-[#E8DEC9] text-[11px]">
                    <span className="text-[#8A6D56]">Dispatch Status:</span>
                    <span className="font-bold text-[#4A2E1B]">{order.orderStatus || 'Order Placed'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#4A2E1B] bg-[#FAF6F0] text-[#4A2E1B]">
                    <th className="py-2 print:py-1 px-3 print:px-2 font-bold w-10 text-center">#</th>
                    <th className="py-2 print:py-1 px-3 print:px-2 font-bold">Item Description & Pack</th>
                    <th className="py-2 print:py-1 px-2 font-bold text-center">HSN</th>
                    <th className="py-2 print:py-1 px-2 font-bold text-center">Qty</th>
                    <th className="py-2 print:py-1 px-3 print:px-2 font-bold text-right">Unit Price</th>
                    <th className="py-2 print:py-1 px-3 print:px-2 font-bold text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DEC9]">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF6F0]/40">
                      <td className="py-2.5 print:py-1.5 px-3 print:px-2 text-center text-[#8A6D56]">{idx + 1}</td>
                      <td className="py-2.5 print:py-1.5 px-3 print:px-2 font-semibold text-[#4A2E1B]">
                        <div>{item.name}</div>
                        <div className="text-[10px] text-[#8A6D56]">Pack Size: {item.weight || '250g'}</div>
                      </td>
                      <td className="py-2.5 print:py-1.5 px-2 text-center text-[#8A6D56] font-mono text-[10px]">1904</td>
                      <td className="py-2.5 print:py-1.5 px-2 text-center font-bold text-[#4A2E1B]">{item.quantity}</td>
                      <td className="py-2.5 print:py-1.5 px-3 print:px-2 text-right text-[#6D4A32]">₹{item.price}</td>
                      <td className="py-2.5 print:py-1.5 px-3 print:px-2 text-right font-bold text-[#4A2E1B]">₹{item.subtotal || (item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Grand Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 print:gap-3 pt-1">
              
              {/* Left: Amount in words & Notes */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                <div className="p-2.5 print:p-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]">
                  <span className="text-[9px] uppercase font-bold text-[#8A6D56] block">
                    Amount Chargeable (in words):
                  </span>
                  <p className="font-serif font-bold text-xs sm:text-sm text-[#4A2E1B] pt-0.5">
                    INR {numberToWords(order.total)} Rupees Only
                  </p>
                </div>

                <div className="space-y-0.5 text-[10px] text-[#8A6D56] leading-tight">
                  <p>• 100% natural, GI-heritage Bihar Makhana. Store sealed in airtight container.</p>
                  <p>• GST rates (5% on natural edible seeds/makhana) included where applicable.</p>
                  <p>• This is a computer-generated tax invoice and requires no physical signature.</p>
                </div>
              </div>

              {/* Right: Calculations */}
              <div className="sm:col-span-5 space-y-1 text-xs">
                <div className="flex justify-between py-0.5 border-b border-gray-100 text-[#6D4A32]">
                  <span>Items Subtotal:</span>
                  <strong className="text-[#4A2E1B]">₹{order.subtotal}</strong>
                </div>

                <div className="flex justify-between py-0.5 border-b border-gray-100 text-[#6D4A32]">
                  <span>Central GST (CGST 2.5%):</span>
                  <span>₹{(order.subtotal * 0.025).toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-0.5 border-b border-gray-100 text-[#6D4A32]">
                  <span>State GST (SGST 2.5%):</span>
                  <span>₹{(order.subtotal * 0.025).toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-0.5 border-b border-gray-100 text-[#6D4A32]">
                  <span>Shipping & Delivery:</span>
                  {order.shippingFee === 0 ? (
                    <strong className="text-[#2D5A27]">FREE (Above ₹{freeShippingThreshold})</strong>
                  ) : (
                    <strong className="text-[#4A2E1B]">₹{order.shippingFee}</strong>
                  )}
                </div>

                <div className="flex justify-between py-1.5 border-t-2 border-[#4A2E1B] text-sm font-bold text-[#4A2E1B]">
                  <span>Grand Total:</span>
                  <span className="text-base text-[#4A2E1B]">₹{order.total}</span>
                </div>
              </div>

            </div>

            {/* Authentic Seal & Signatory Footer */}
            <div className="border-t border-[#E8DEC9] pt-3.5 print:pt-2.5 flex flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full border-2 border-[#D99B26] bg-[#FEF8EA] text-[#4A2E1B] flex flex-col items-center justify-center font-bold text-[8px] text-center leading-tight shadow-xs">
                  <span>100%</span>
                  <span>AUTHENTIC</span>
                  <span>BIHAR</span>
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#4A2E1B] text-[11px] leading-tight">Mithila Heritage Guarantee</p>
                  <p className="text-[10px] text-[#8A6D56]">Hand-sorted & roasted in Mithila, Bihar.</p>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="h-7 flex items-center justify-end">
                  <span className="font-serif italic font-bold text-[#4A2E1B] text-base tracking-wide border-b border-gray-400 pb-0.5">
                    Mithila Makhana Family
                  </span>
                </div>
                <p className="text-[9px] text-[#8A6D56] font-bold uppercase tracking-wider">
                  Authorized Signatory
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Floating Print Button (Screen Only) */}
        <div className="no-print mt-6 mb-8 flex items-center justify-center space-x-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] text-sm font-bold transition-all shadow-lg cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D99B26]" />
            <span>Print Tax Invoice Now</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 px-5 py-3 rounded-2xl bg-white hover:bg-gray-100 text-[#4A2E1B] border border-[#E8DEC9] text-sm font-bold transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close Window</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default InvoiceView;
