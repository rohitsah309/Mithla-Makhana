import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import Store from './services/store.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://mithla-makhana.vercel.app/',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images & uploads
const uploadsDir = path.join(__dirname, '../public/uploads');
app.use('/images', express.static(uploadsDir));
app.use('/uploads', express.static(uploadsDir));

// System Health & Diagnostics API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'Mithila Makhana',
    tagline: 'Authentic Bihar. Premium Makhana. From our family to yours.',
    timestamp: new Date().toISOString()
  });
});

// Public store settings (delivery thresholds used by cart/checkout)
app.get('/api/settings', (req, res, next) => {
  try {
    const settings = Store.getSettings();
    res.json({
      success: true,
      settings: {
        freeShippingThreshold: settings.freeShippingThreshold,
        standardShippingFee: settings.standardShippingFee,
        brandName: settings.brandName,
        supportPhone: settings.supportPhone,
        supportEmail: settings.supportEmail,
        isStoreOpen: settings.isStoreOpen
      }
    });
  } catch (err) {
    next(err);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
