import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Key, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const otpInputsRef = useRef([]);
  const { register, sendRegisterOtp, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const targetDestination = redirectParam || '/shop';

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate(targetDestination, { replace: true });
    }
  }, [isAuthenticated, targetDestination, navigate]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  // STEP 1: Submit Details & Request Email OTP
  const handleInitiateRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendRegisterOtp({
        email: formData.email,
        name: formData.name
      });

      if (res.data?.success) {
        setStep('otp');
        setResendTimer(60);
        if (res.data.devOtp) {
          setDevOtpHint(res.data.devOtp);
        }
        setInfoMsg(`A 6-digit verification code has been sent to ${formData.email}.`);
        success('Verification code sent to your email!');

        // Focus first OTP input on next tick
        setTimeout(() => {
          if (otpInputsRef.current[0]) {
            otpInputsRef.current[0].focus();
          }
        }, 150);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send verification code. Please try again.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Changes
  const handleOtpChange = (index, value) => {
    // Only accept numeric digits
    const cleaned = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (!cleaned) {
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // Handle single digit input
    newOtp[index] = cleaned[cleaned.length - 1];
    setOtp(newOtp);
    if (errorMsg) setErrorMsg('');

    // Advance to next input
    if (index < 5 && newOtp[index] !== '') {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // OTP Keydown (for backspace navigation)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Pasting 6-digit code
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);

    // Focus last filled or 6th input
    const nextIdx = Math.min(pasted.length, 5);
    otpInputsRef.current[nextIdx]?.focus();
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setErrorMsg('');

    try {
      const res = await sendRegisterOtp({
        email: formData.email,
        name: formData.name
      });

      if (res.data?.success) {
        setResendTimer(60);
        if (res.data.devOtp) {
          setDevOtpHint(res.data.devOtp);
        }
        success('New verification code sent to your email!');
        setInfoMsg('Fresh verification code sent. Please check your inbox or spam folder.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend verification code.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setResending(false);
    }
  };

  // Auto-fill dev code helper
  const handleAutoFillDevOtp = () => {
    if (!devOtpHint) return;
    const digits = devOtpHint.split('').slice(0, 6);
    setOtp(digits);
    if (otpInputsRef.current[5]) {
      otpInputsRef.current[5].focus();
    }
  };

  // STEP 2: Verify OTP & Complete Registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const otpCode = otp.join('').trim();
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      otp: otpCode
    });
    setLoading(false);

    if (res?.success) {
      navigate(targetDestination, { replace: true });
    } else {
      setErrorMsg(res?.message || 'Invalid or expired verification code.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#FAF6F0] border-2 border-[#D99B26] p-1 mx-auto flex items-center justify-center shadow-md">
          <img 
            src="/images/plain-makhana-bowl.png" 
            alt="Mithila Makhana" 
            className="w-full h-full object-cover rounded-full" 
          />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#4A2E1B]">
          {step === 'form' ? 'Create Your Account' : 'Verify Your Email'}
        </h1>
        <p className="text-xs text-[#8A6D56]">
          {step === 'form' 
            ? 'Join the Mithila Makhana family for exclusive updates and faster ordering.' 
            : 'Enter the 6-digit code sent to your email to activate your account.'}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-6">
        
        {/* Contextual Checkout Reminder */}
        {redirectParam === '/checkout' && (
          <div className="bg-[#FAF6F0] border border-[#D99B26]/40 rounded-2xl p-3.5 flex items-start space-x-2.5 text-xs text-[#4A2E1B]">
            <Sparkles className="w-4 h-4 text-[#D99B26] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Create an account to complete checkout</span>
              <span className="text-[#6D4A32] text-[11px]">Your cart items are saved and ready for order placement!</span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Global Info Banner */}
        {infoMsg && step === 'otp' && (
          <div className="p-3 rounded-xl bg-[#EAF3E7] text-[#2D5A27] text-xs border border-[#2D5A27]/20 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D5A27] flex-shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* =========================================================================
            STEP 1: Registration Form
            ========================================================================= */}
        {step === 'form' && (
          <form onSubmit={handleInitiateRegister} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                Email Address * (We will send an OTP code)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Mobile Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <span>Sending Verification Code...</span>
              ) : (
                <>
                  <span>Continue to Email Verification</span>
                  <ArrowRight className="w-4 h-4 text-[#D99B26]" />
                </>
              )}
            </button>
          </form>
        )}

        {/* =========================================================================
            STEP 2: Email OTP Verification
            ========================================================================= */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-6">
            
            {/* Top Indicator */}
            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#FEF8EA] border border-[#D99B26]/30 flex items-center justify-center text-[#D99B26]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#8A6D56] block uppercase tracking-wider font-bold">
                    Recipient Email
                  </span>
                  <span className="text-xs font-bold text-[#4A2E1B]">
                    {formData.email}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="text-[11px] font-bold text-[#D99B26] hover:underline cursor-pointer flex items-center space-x-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>

            {/* 6-Digit OTP Boxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4A2E1B] block text-center">
                Enter 6-Digit Verification Code
              </label>

              <div className="flex items-center justify-center space-x-2 sm:space-x-3" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-2xl bg-[#FAF6F0] border-2 border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] focus:bg-white text-[#4A2E1B] transition-all shadow-2xs"
                  />
                ))}
              </div>

              <p className="text-[11px] text-center text-[#8A6D56] pt-1">
                ⏱ Code expires in <strong>10 minutes</strong>. Single use only.
              </p>
            </div>

            {/* Dev Mode Helper (Auto-fill pill when SMTP is not configured) */}
            {devOtpHint && (
              <div className="p-3 rounded-2xl bg-[#FEF8EA] border border-[#D99B26]/30 text-xs text-[#4A2E1B] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                  <span>
                    Dev Code: <strong className="font-mono text-sm tracking-wider">{devOtpHint}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDevOtp}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#D99B26] text-white hover:bg-[#b07812] transition-colors cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {/* Resend Timer & Actions */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#8A6D56]">
                Didn't receive the code?
              </span>

              {resendTimer > 0 ? (
                <span className="text-[#8A6D56] font-semibold">
                  Resend in <strong>{resendTimer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="font-bold text-[#D99B26] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resending ? 'Resending...' : 'Resend Code'}</span>
                </button>
              )}
            </div>

            {/* Submit Verification Button */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Verifying & Creating Account...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#D99B26]" />
                    <span>Verify Email & Create Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="w-full py-2 text-xs font-semibold text-[#8A6D56] hover:text-[#4A2E1B] transition-colors"
              >
                ← Back to edit registration details
              </button>
            </div>

          </form>
        )}

        {/* Sign In Alternative Link */}
        <div className="text-center pt-2 text-xs text-[#6D4A32] border-t border-gray-100">
          <span>Already have an account? </span>
          <Link 
            to={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`} 
            className="font-bold text-[#D99B26] hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Register;
