import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || location.state?.from?.pathname || '/';

  // If redirected with state email, update email
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password, 'customer');
    setLoading(false);
    if (res?.success) {
      if (res.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="max-w-md px-4 py-16 mx-auto space-y-8">
      
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 rounded-full bg-[#FAF6F0] border-2 border-[#D99B26] p-1 mx-auto flex items-center justify-center shadow-xs">
          <img src="/images/plain-makhana-bowl.png" alt="Mithila Makhana" className="object-cover w-full h-full rounded-full" />
        </div>
        <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#EAF3E7] border border-[#2D5A27]/20 text-[#2D5A27] text-[10px] font-bold uppercase tracking-wider">
          <UserCheck className="w-3 h-3" />
          <span>Customer Account</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#4A2E1B]">
          Sign In
        </h1>
        <p className="text-xs text-[#8A6D56]">
          Access your past orders, track shipments, and manage saved delivery addresses.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-[#E8DEC9] shadow-soft space-y-6">
        
        {redirectParam === '/checkout' && (
          <div className="bg-[#FAF6F0] border border-[#D99B26]/40 rounded-2xl p-3.5 flex items-start space-x-2.5 text-xs text-[#4A2E1B]">
            <Sparkles className="w-4 h-4 text-[#D99B26] flex-shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold">Sign in to complete your checkout</span>
              <span className="text-[#6D4A32] text-[11px]">Your selected makhana items are saved in your cart and ready for order placement.</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A6D56] hover:text-[#4A2E1B]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <Link
                to={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-[11px] font-semibold text-[#D99B26] hover:text-[#B07812] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? <span>Authenticating...</span> : <span>Sign In</span>}
          </button>
        </form>

        {/* Demo Fast Login Button */}
        <div className="pt-4 border-t border-[#E8DEC9] space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8A6D56] font-bold">
            <span>Demo Customer Account</span>
            <span className="text-[#2D5A27]">1-Click Autofill</span>
          </div>
          <button
            type="button"
            onClick={() => handleQuickLogin('customer@mithilamakhana.com', 'customer123')}
            className="w-full p-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE2] border border-[#E8DEC9] text-left text-xs text-[#4A2E1B] transition-colors flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center font-bold">
              <UserCheck className="w-3.5 h-3.5 mr-1.5 text-[#2D5A27]" />
              <span>customer@mithilamakhana.com</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8DEC9] text-[#6D4A32]">
              customer123
            </span>
          </button>
        </div>

        <div className="text-center pt-2 text-xs text-[#6D4A32]">
          <span>Don't have an account? </span>
          <Link 
            to={`/register${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`} 
            className="font-bold text-[#D99B26] hover:underline"
          >
            Register here
          </Link>
        </div>

        {/* Staff & Admin Portal Link */}
        <div className="pt-2 border-t border-[#E8DEC9]">
          <div className="bg-[#FAF6F0] rounded-2xl p-3 border border-[#E8DEC9] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#D99B26]" />
              <span className="text-[#6D4A32] text-[11px] font-medium">Store Administrator or Staff?</span>
            </div>
            <Link 
              to="/admin/login" 
              className="font-bold text-[#4A2E1B] hover:text-[#D99B26] text-xs flex items-center space-x-1"
            >
              <span>Admin Portal →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
