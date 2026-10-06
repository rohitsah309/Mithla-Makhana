import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Key, 
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, isAdmin, user } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessDeniedMsg, setAccessDeniedMsg] = useState('');

  // If already authenticated as admin, redirect to /admin dashboard
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        // If a customer is logged in and visits admin login, notify them
        setAccessDeniedMsg('You are currently signed in as a Customer. Administrator privileges are required to access this portal.');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAccessDeniedMsg('');
    setLoading(true);

    try {
      const res = await login(email.trim(), password, 'admin');
      setLoading(false);

      if (res?.success) {
        // Verify role: Only 'admin' role accounts are permitted in the Admin Portal
        if (res.user?.role === 'admin') {
          toastSuccess(`Welcome back, ${res.user.name || 'Administrator'}!`);
          navigate('/admin', { replace: true });
        } else {
          // A customer account attempted to log in here
          await logout(); // Clear non-admin customer token from admin portal
          setAccessDeniedMsg('Access Denied: This portal is strictly restricted to store administrators and staff. Customer accounts must sign in via the Customer Login page.');
          toastError('Access Denied: Administrator account required.');
        }
      }
    } catch (err) {
      setLoading(false);
      console.error('Admin login error', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A0E08] text-[#FAF6F0] flex flex-col justify-between relative overflow-hidden selection:bg-[#D99B26] selection:text-[#1A0E08]">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D99B26]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2D5A27]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Portal Header Bar */}
      <header className="relative z-10 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-[#3D2516]/60 backdrop-blur-xs">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-full bg-[#27170E] border-2 border-[#D99B26] p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <img 
              src="/images/plain-makhana-bowl.png" 
              alt="Mithila Makhana" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-[#FAF6F0] block leading-none">
              Mithila Makhana
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#D99B26] font-bold">
              Staff & Operations Suite
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#D8C3A5] hover:text-white transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#D99B26]" />
          <span>Customer Store</span>
        </Link>
      </header>

      {/* Center Sign In Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full space-y-6">

          {/* Portal Title & Badge */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#3D2516] border border-[#D99B26]/40 text-[#F3BF58] text-[11px] font-bold tracking-wider uppercase shadow-inner">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>Restricted Staff Portal</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0] tracking-tight">
              Administrator Sign In
            </h1>
            
            <p className="text-xs text-[#A89078] max-w-sm mx-auto leading-relaxed">
              Authorized personnel only. Manage catalog, live orders, logistics, and store operations.
            </p>
          </div>

          {/* Access Denied Warning Box (if customer attempted) */}
          {accessDeniedMsg && (
            <div className="bg-red-950/70 border border-red-700/60 rounded-2xl p-4 text-xs text-red-200 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{accessDeniedMsg}</span>
              </div>
              <div className="pt-1">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#F3BF58] hover:underline"
                >
                  <span>Go to Customer Sign In</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-[#27170E]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#4A2E1B] shadow-2xl space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Staff Email */}
              <div>
                <label className="block text-xs font-bold text-[#FAF6F0] mb-1.5">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#8A6D56]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mithilamakhana.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1A0E08] rounded-xl border border-[#4A2E1B] text-xs font-medium text-[#FAF6F0] placeholder-[#6D4A32] focus:outline-none focus:border-[#D99B26] focus:ring-1 focus:ring-[#D99B26] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#FAF6F0]">
                    Administrator Password
                  </label>
                  <Link
                    to={`/forgot-password?portal=admin${email ? `&email=${encodeURIComponent(email)}` : ''}`}
                    className="text-[11px] font-semibold text-[#D99B26] hover:text-[#F3BF58] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8A6D56]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#1A0E08] rounded-xl border border-[#4A2E1B] text-xs font-medium text-[#FAF6F0] placeholder-[#6D4A32] focus:outline-none focus:border-[#D99B26] focus:ring-1 focus:ring-[#D99B26] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[#8A6D56] hover:text-[#FAF6F0] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Initial Password Notice */}
              <div className="bg-[#1A0E08]/70 rounded-xl p-3 border border-[#3D2516] flex items-start space-x-2 text-[11px] text-[#A89078]">
                <Key className="w-3.5 h-3.5 text-[#D99B26] flex-shrink-0 mt-0.5" />
                <span>
                  First-time logging in with staff initial credentials? You will be prompted to set your new password immediately.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D99B26] to-[#B07812] hover:from-[#E5A832] hover:to-[#BD841A] text-[#1A0E08] font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#D99B26]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#1A0E08]" />
                    <span>Verifying Authority...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#1A0E08]" />
                    <span>Authorize & Enter Admin Suite</span>
                  </>
                )}
              </button>
            </form>

            {/* Switch to Customer Login */}
            <div className="text-center pt-2 text-xs text-[#A89078] border-t border-[#3D2516]/60">
              <span>Shopping for Makhana? </span>
              <Link 
                to="/login" 
                className="font-bold text-[#F3BF58] hover:underline"
              >
                Switch to Customer Sign In →
              </Link>
            </div>

          </div>

          {/* Footer Security Badge */}
          <div className="text-center space-y-1 text-[11px] text-[#6D4A32]">
            <p className="flex items-center justify-center space-x-1.5">
              <Lock className="w-3 h-3 text-[#D99B26]" />
              <span>TLS 1.3 End-to-End Encrypted Session</span>
            </p>
            <p>© {new Date().getFullYear()} Mithila Makhana Operations. All access attempts logged.</p>
          </div>

        </div>
      </main>

    </div>
  );
};

export default AdminLogin;
