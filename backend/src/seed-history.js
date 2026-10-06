import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ordersPath = path.join(__dirname, '../data/orders.json');
const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));

// Check if historical orders already added
const has2025 = orders.some(o => o.orderId && o.orderId.includes('MM-2025-'));
if (has2025) {
  console.log('Historical orders already seeded. Total orders:', orders.length);
  process.exit(0);
}

const customers = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@gmail.com', phone: '9823411223', city: 'Patna', state: 'Bihar', pincode: '800001', address: 'Boring Road, Anandpuri' },
  { name: 'Priya Verma', email: 'priya.verma@outlook.com', phone: '9845123987', city: 'Darbhanga', state: 'Bihar', pincode: '846004', address: 'Tower Chowk, Station Road' },
  { name: 'Ananya Jha', email: 'ananya.jha@mithila.org', phone: '9876123450', city: 'Madhubani', state: 'Bihar', pincode: '847211', address: 'Shanti Kunj, Ward 4' },
  { name: 'Rohan Gupta', email: 'rohan.gupta@yahoo.com', phone: '9911223344', city: 'Delhi', state: 'Delhi', pincode: '110001', address: 'Connaught Place, Block B' },
  { name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '9822334455', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', address: 'Bandra West, Hill Road' },
  { name: 'Kavita Patel', email: 'kavita.p@gmail.com', phone: '9712345678', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', address: 'Satellite Road, Jodhpur Cross' },
  { name: 'Sneha Roy', email: 'sneha.roy@gmail.com', phone: '9833445566', city: 'Kolkata', state: 'West Bengal', pincode: '700029', address: 'Ballygunge Circular Road' },
  { name: 'Aditya Nair', email: 'aditya.n@gmail.com', phone: '9447112233', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', address: 'Indiranagar, 100ft Road' }
];

const productPacks = [
  { product: 'prod_plain_01', name: 'Premium Plain Makhana', image: '/images/plain-makhana-bowl.png', price: 249, weight: '250g' },
  { product: 'prod_roasted_02', name: 'Slow Roasted Makhana (Pink Salt & Ghee)', image: '/images/roasted-makhana-jar.png', price: 279, weight: '250g' },
  { product: 'prod_masala_03', name: 'Mithila Masala Makhana (Spice Blend)', image: '/images/roasted-makhana-jar.png', price: 299, weight: '250g' },
  { product: 'prod_cheese_05', name: 'White Cheddar Cheese & Herbs Makhana', image: '/images/cheese-flavoured-dip.png', price: 319, weight: '250g' },
  { product: 'prod_caramel_06', name: 'Caramel & Organic Jaggery Makhana', image: '/images/roasted-makhana-jar.png', price: 329, weight: '250g' },
  { product: 'prod_raw_07', name: 'Sourced Mithila Makhana Seeds (Fox Nut Seeds)', image: '/images/heritage-seeds-burlap.png', price: 349, weight: '500g' }
];

// Months to generate data for:
// 2025: Oct, Nov, Dec
// 2026: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep
const historyMonths = [
  { year: 2025, month: 10, days: 31, ordersTarget: 4 },
  { year: 2025, month: 11, days: 30, ordersTarget: 5 },
  { year: 2025, month: 12, days: 31, ordersTarget: 6 },
  { year: 2026, month: 1, days: 31, ordersTarget: 5 },
  { year: 2026, month: 2, days: 28, ordersTarget: 5 },
  { year: 2026, month: 3, days: 31, ordersTarget: 6 },
  { year: 2026, month: 4, days: 30, ordersTarget: 6 },
  { year: 2026, month: 5, days: 31, ordersTarget: 7 },
  { year: 2026, month: 6, days: 30, ordersTarget: 7 },
  { year: 2026, month: 7, days: 31, ordersTarget: 8 },
  { year: 2026, month: 8, days: 31, ordersTarget: 9 },
  { year: 2026, month: 9, days: 30, ordersTarget: 10 }
];

const newOrders = [];

historyMonths.forEach(hm => {
  for (let i = 0; i < hm.ordersTarget; i++) {
    const cust = customers[(i + hm.month) % customers.length];
    const day = Math.floor(Math.random() * (hm.days - 1)) + 1;
    const hour = Math.floor(Math.random() * 12) + 9;
    const minute = Math.floor(Math.random() * 59);
    const dateObj = new Date(Date.UTC(hm.year, hm.month - 1, day, hour, minute));
    const isoDate = dateObj.toISOString();
    
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `MM-${hm.year}-${randomSuffix}`;
    const invoiceNumber = `INV-${hm.year}-${randomSuffix}`;

    const numItems = (i % 3) + 1;
    const items = [];
    let subtotal = 0;

    for (let k = 0; k < numItems; k++) {
      const p = productPacks[(i + k + hm.month) % productPacks.length];
      const qty = ((k + i) % 2) + 1;
      const itemSub = p.price * qty;
      subtotal += itemSub;
      items.push({
        product: p.product,
        name: p.name,
        image: p.image,
        price: p.price,
        weight: p.weight,
        quantity: qty,
        subtotal: itemSub
      });
    }

    const shippingFee = subtotal >= 499 ? 0 : 50;
    const total = subtotal + shippingFee;
    const isCod = (i % 3 === 0); // 33% COD, 67% Razorpay
    const paymentMethod = isCod ? 'cod' : 'razorpay';
    const razorpayPaymentId = isCod ? '' : `pay_${hm.year}${randomSuffix}mm`;
    const razorpayOrderId = isCod ? '' : `order_${hm.year}${randomSuffix}mm`;

    newOrders.push({
      _id: `ord_${hm.year}_${randomSuffix}_${i}`,
      orderId,
      invoiceNumber,
      invoiceDate: isoDate,
      orderStatus: 'Delivered',
      paymentStatus: 'completed',
      statusHistory: [
        { status: 'Order Placed', timestamp: isoDate, notes: 'Order confirmed and placed successfully' },
        { status: 'Shipped', timestamp: new Date(dateObj.getTime() + 86400000).toISOString(), notes: 'Dispatched via Express Courier' },
        { status: 'Delivered', timestamp: new Date(dateObj.getTime() + 259200000).toISOString(), notes: 'Delivered to customer' },
        ...(isCod ? [{ status: 'Payment: Received', timestamp: new Date(dateObj.getTime() + 259200000).toISOString(), notes: 'COD cash collected by courier' }] : [])
      ],
      createdAt: isoDate,
      updatedAt: isoDate,
      user: 'usr_customer_01',
      customer: {
        name: cust.name,
        email: cust.email,
        phone: cust.phone
      },
      items,
      shippingAddress: {
        fullName: cust.name,
        mobile: cust.phone,
        email: cust.email,
        address: cust.address,
        city: cust.city,
        state: cust.state,
        pincode: cust.pincode
      },
      subtotal,
      shippingFee,
      discount: 0,
      total,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId
    });
  }
});

// Prepend or merge historical orders with current orders, sorted descending by createdAt
const combined = [...orders, ...newOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
fs.writeFileSync(ordersPath, JSON.stringify(combined, null, 2), 'utf-8');
console.log(`Successfully added ${newOrders.length} historical orders. Total orders now: ${combined.length}`);
