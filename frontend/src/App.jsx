import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context Providers
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import ScrollToTop from './components/ScrollToTop';
import FirstLoginPasswordChange from './components/FirstLoginPasswordChange';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import WhyMakhana from './pages/WhyMakhana';
import Recipes from './pages/Recipes';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import PaymentFailed from './pages/PaymentFailed';
import TrackOrder from './pages/TrackOrder';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';

/**
 * AppRoutes dynamically switches between the Admin Management Portal
 * and the Customer/Guest Storefront.
 * When logged in as Admin, the user is strictly restricted from viewing or shopping
 * on consumer pages (Home, Shop, About, Contact, Why Makhana, Recipes, Cart, Checkout)
 * and is isolated to the Admin Control Suite.
 */
const AppRoutes = () => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const isAdminLoginRoute = location.pathname === '/admin/login';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#D99B26] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#8A6D56] font-medium">Loading Mithila Makhana...</span>
      </div>
    );
  }

  // 1. DEDICATED ADMIN LOGIN: Isolated from consumer storefront navbar and footer
  if (isAdminLoginRoute) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return (
      <div className="min-h-screen bg-[#1A0E08] text-[#FAF6F0]">
        <ScrollToTop />
        <AdminLogin />
      </div>
    );
  }

  // 2. ADMIN PORTAL: Admin is restricted to Admin Suite only (no consumer navbar/footer/shop/pages)
  if (isAdmin) {
    // If admin was created with initial password, force them to change password on first login
    if (user?.mustChangePassword) {
      return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#321F12]">
          <ScrollToTop />
          <FirstLoginPasswordChange />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#321F12]">
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
          {/* Any attempt to navigate to consumer pages (/, /shop, /about, /cart, etc.) redirects immediately to /admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    );
  }

  // 3. CUSTOMER & GUEST STOREFRONT: Full retail browsing and shopping experience
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#321F12]">
      <ScrollToTop />
      
      {/* Sticky Consumer Navbar */}
      <Navbar onOpenSearch={() => setSearchModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slugOrId" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/why-makhana" element={<WhyMakhana />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          {/* Non-admins attempting /admin are redirected to dedicated admin login */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Consumer Footer */}
      <Footer />

      {/* Quick Search Overlay Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <AppRoutes />
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
