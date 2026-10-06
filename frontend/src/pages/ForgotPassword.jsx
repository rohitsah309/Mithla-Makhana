import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Key, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  // Steps: 'email' (Send Verification) -> 'otp' (Validate OTP) -> 'new_password' (New Password Page) -> 'success'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const otpInputsRef = useRef([]);
  const { forgotPassword, validateResetOtp, resetPassword, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const portal = searchParams.get('portal') === 'admin' ? 'admin' : 'customer';
  const isAdminReset = portal === 'admin';

  // Pre-fill email from query param or router state
  useEffect(() => {
    const emailParam = searchParams.get('email') || location.state?.email;
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/shop', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

  // STEP 1: SEND VERIFICATION
  const handleSendVerification = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email: email.trim().toLowerCase(), portal });
      if (res.data?.success) {
        setStep('otp');
        setResendTimer(60);
        if (res.data.devOtp) {
          setDevOtpHint(res.data.devOtp);
        }
        success('Verification code sent to your email!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send verification code. Please check your email.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setErrorMsg('');

    try {
      const res = await forgotPassword({ email: email.trim().toLowerCase(), portal });
      if (res.data?.success) {
        setResendTimer(60);
        if (res.data.devOtp) {
          setDevOtpHint(res.data.devOtp);
        }
        success('Fresh verification code sent to your email!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend code.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setResending(false);
    }
  };

  // OTP Box Key Handling
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (!cleaned) {
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    newOtp[index] = cleaned[cleaned.length - 1];
    setOtp(newOtp);
    if (errorMsg) setErrorMsg('');

    // Auto-advance to next box
    if (index < 5 && newOtp[index] !== '') {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);

    const nextIdx = Math.min(pasted.length, 5);
    otpInputsRef.current[nextIdx]?.focus();
  };

  // STEP 2: VALIDATE OTP
  const handleValidateOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const otpCode = otp.join('').trim();
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await validateResetOtp({
        email: email.trim().toLowerCase(),
        otp: otpCode,
        portal
      });

      if (res.data?.success) {
        setResetToken(res.data.resetToken);
        setStep('new_password');
        success('Code verified successfully! Now set your new password.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired verification code.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: SUBMIT NEW PASSWORD
  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        email: email.trim().toLowerCase(),
        resetToken,
        otp: otp.join('').trim(),
        newPassword,
        portal
      });

      if (res.data?.success) {
        setStep('success');
        success(isAdminReset ? 'Administrator password updated successfully!' : 'Password updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password. Please try again.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'email': return 1;
      case 'otp': return 2;
      case 'new_password': return 3;
      default: return 3;
    }
  };

  const currentStepNum = getStepNumber();

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#FAF6F0] border-2 border-[#D99B26] p-1 mx-auto flex items-center justify-center">
          <img src="/images/plain-makhana-bowl.png" alt="Mithila Makhana" className="w-full h-full object-cover rounded-full" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#4A2E1B]">
          {isAdminReset ? 'Admin Account Recovery' : 'Account Recovery'}
        </h1>
        <p className="text-xs text-[#8A6D56]">
          {isAdminReset ? 'Mithila Makhana Administrator Password Reset' : 'Mithila Makhana Secure Password Reset'}
        </p>
      </div>

      {/* 3-Step Wizard Visual Progress Bar */}
      {step !== 'success' && (
        <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-[#E8DEC9] -z-0" />
            <div 
              className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-[#2D5A27] transition-all duration-300 -z-0"
              style={{
                width: currentStepNum === 1 ? '0%' : currentStepNum === 2 ? '50%' : '100%'
              }}
            />

            {/* Step 1 Indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStepNum > 1 
                  ? 'bg-[#2D5A27] text-white' 
                  : currentStepNum === 1 
                    ? 'bg-[#D99B26] text-white ring-4 ring-[#FEF8EA]' 
                    : 'bg-[#FAF6F0] text-[#8A6D56] border border-[#E8DEC9]'
              }`}>
                {currentStepNum > 1 ? '✓' : '1'}
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${currentStepNum >= 1 ? 'text-[#4A2E1B]' : 'text-[#8A6D56]'}`}>
                Verification
              </span>
            </div>

            {/* Step 2 Indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStepNum > 2 
                  ? 'bg-[#2D5A27] text-white' 
                  : currentStepNum === 2 
                    ? 'bg-[#D99B26] text-white ring-4 ring-[#FEF8EA]' 
                    : 'bg-[#FAF6F0] text-[#8A6D56] border border-[#E8DEC9]'
              }`}>
                {currentStepNum > 2 ? '✓' : '2'}
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${currentStepNum >= 2 ? 'text-[#4A2E1B]' : 'text-[#8A6D56]'}`}>
                Validate OTP
              </span>
            </div>

            {/* Step 3 Indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStepNum === 3 
                  ? 'bg-[#D99B26] text-white ring-4 ring-[#FEF8EA]' 
                  : 'bg-[#FAF6F0] text-[#8A6D56] border border-[#E8DEC9]'
              }`}>
                3
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${currentStepNum === 3 ? 'text-[#4A2E1B]' : 'text-[#8A6D56]'}`}>
                New Password
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-8 border border-[#E8DEC9] shadow-soft space-y-6">
        
        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ================= STEP 1: SEND VERIFICATION ================= */}
        {step === 'email' && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="font-serif text-2xl font-bold text-[#4A2E1B] flex items-center">
                <Mail className="w-5 h-5 mr-2 text-[#D99B26]" />
                Forgot Password
              </h2>
              <p className="text-xs text-[#8A6D56] leading-relaxed">
                Enter your registered {isAdminReset ? 'administrator' : 'account'} email. We will send a secure 6-digit OTP code to verify your identity.
              </p>
            </div>

            <form onSubmit={handleSendVerification} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#E8DEC9]">
              <Link 
                to={isAdminReset ? '/admin/login' : '/login'}
                className="inline-flex items-center text-xs font-medium text-[#8A6D56] hover:text-[#4A2E1B] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>{isAdminReset ? 'Back to Admin Sign In' : 'Back to Sign In'}</span>
              </Link>
            </div>
          </div>
        )}

        {/* ================= STEP 2: ENTER OTP -> VALIDATE OTP ================= */}
        {step === 'otp' && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="font-serif text-2xl font-bold text-[#4A2E1B] flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-[#2D5A27]" />
                Enter OTP
              </h2>
              <p className="text-xs text-[#8A6D56]">
                We sent a 6-digit code to <strong className="text-[#4A2E1B]">{email}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setErrorMsg('');
                  }}
                  className="ml-2 text-[#D99B26] hover:underline font-bold"
                >
                  Edit
                </button>
              </p>
            </div>

            {/* Dev Preview Helper Badge */}
            {devOtpHint && (
              <div className="p-3 rounded-2xl bg-[#FEF8EA] border border-[#D99B26]/40 flex items-center justify-between text-xs text-[#B07812]">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dev Preview OTP: <strong>{devOtpHint}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const digits = devOtpHint.split('').slice(0, 6);
                    setOtp(digits);
                    otpInputsRef.current[5]?.focus();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#D99B26] text-white text-[10px] font-bold hover:bg-[#B07812]"
                >
                  Auto-fill
                </button>
              </div>
            )}

            <form onSubmit={handleValidateOtp} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-2.5 text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold rounded-xl bg-[#FAF6F0] border-2 border-[#E8DEC9] text-[#4A2E1B] focus:border-[#D99B26] focus:bg-white focus:outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>

                {/* Resend Timer */}
                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-[11px] text-[#8A6D56]">Didn't get the code?</span>
                  {resendTimer > 0 ? (
                    <span className="text-[11px] text-[#8A6D56] font-medium">
                      Resend in <strong className="text-[#D99B26]">{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resending}
                      className="text-[11px] font-bold text-[#D99B26] hover:underline flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                      <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Validating OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Validate OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#E8DEC9]">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="inline-flex items-center text-xs font-medium text-[#8A6D56] hover:text-[#4A2E1B]"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Change Email Address</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: NEW PASSWORD PAGE ================= */}
        {step === 'new_password' && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="font-serif text-2xl font-bold text-[#4A2E1B] flex items-center">
                <Key className="w-5 h-5 mr-2 text-[#D99B26]" />
                New Password Page
              </h2>
              <p className="text-xs text-[#8A6D56]">
                OTP verified for <strong className="text-[#4A2E1B]">{email}</strong>. Create your new secure password below.
              </p>
            </div>

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
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
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Re-type new password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A6D56] hover:text-[#4A2E1B]"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[11px] text-[#8A6D56] space-y-1">
                <span className="font-bold text-[#4A2E1B] block">Password Requirements:</span>
                <div className="flex items-center space-x-1.5">
                  <span className={newPassword.length >= 6 ? 'text-[#2D5A27] font-bold' : 'text-[#8A6D56]'}>
                    {newPassword.length >= 6 ? '✓' : '•'} At least 6 characters
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={newPassword && newPassword === confirmPassword ? 'text-[#2D5A27] font-bold' : 'text-[#8A6D56]'}>
                    {newPassword && newPassword === confirmPassword ? '✓' : '•'} Passwords match
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================= STEP 4: SUCCESS CONFIRMATION ================= */}
        {step === 'success' && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-[#EAF3E7] border-2 border-[#2D5A27]/40 text-[#2D5A27] mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#4A2E1B]">Password Reset Successful!</h2>
              <p className="text-xs text-[#6D4A32] max-w-xs mx-auto">
                Your {isAdminReset ? 'administrator' : 'account'} password has been securely updated. You can now log in using your new credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(isAdminReset ? '/admin/login' : '/login', { state: { email } })}
              className="w-full py-3 rounded-2xl bg-[#2D5A27] hover:bg-[#1E3E1A] text-white font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{isAdminReset ? 'Proceed to Admin Sign In' : 'Proceed to Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
