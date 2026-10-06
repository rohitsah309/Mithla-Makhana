import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Key, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '', onSuccess }) => {
  const [step, setStep] = useState('request'); // 'request' | 'reset' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const otpInputsRef = useRef([]);
  const { forgotPassword, resetPassword } = useAuth();
  const { success, error: toastError } = useToast();

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('request');
      setEmail(initialEmail || '');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setResendTimer(0);
    }
  }, [isOpen, initialEmail]);

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // STEP 1: Request Password Reset Code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email: email.trim().toLowerCase() });
      if (res.data?.success) {
        setStep('reset');
        setResendTimer(60);
        success('Verification code sent to your email!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset code. Please try again.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setErrorMsg('');

    try {
      const res = await forgotPassword({ email: email.trim().toLowerCase() });
      if (res.data?.success) {
        setResendTimer(60);
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

    // Advance to next box
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

  // STEP 3: Reset Password Submission
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const otpCode = otp.join('').trim();
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

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
        otp: otpCode,
        newPassword
      });

      if (res.data?.success) {
        setStep('success');
        success('Password updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed. Please check your code.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (onSuccess) {
      onSuccess(email);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#E8DEC9] shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8A6D56] hover:text-[#4A2E1B] hover:bg-[#FAF6F0] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Enter Email */}
        {step === 'request' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF8EA] border border-[#D99B26]/30 text-[#B07812] mx-auto flex items-center justify-center shadow-inner">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#4A2E1B]">Forgot Password?</h2>
              <p className="text-xs text-[#8A6D56]">
                Enter your registered email address and we'll send a 6-digit verification code to reset your password.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-4">
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
                className="w-full py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#E8DEC9]">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-[#8A6D56] hover:text-[#4A2E1B]"
              >
                Remember your password? <span className="text-[#D99B26] font-bold">Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 'reset' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF3E7] border border-[#2D5A27]/30 text-[#2D5A27] mx-auto flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#4A2E1B]">Enter Reset Code</h2>
              <p className="text-xs text-[#8A6D56]">
                Code sent to <span className="font-semibold text-[#4A2E1B]">{email}</span>
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="ml-2 text-[#D99B26] hover:underline font-bold"
                >
                  Edit
                </button>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              {/* 6-box OTP input */}
              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-2 text-center">
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

                {/* Resend timer */}
                <div className="flex justify-between items-center mt-2.5 text-xs">
                  <span className="text-[11px] text-[#8A6D56]">Didn't receive the email?</span>
                  {resendTimer > 0 ? (
                    <span className="text-[11px] text-[#8A6D56] font-medium">
                      Resend in <strong className="text-[#D99B26]">{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resending}
                      className="text-[11px] font-bold text-[#D99B26] hover:underline flex items-center space-x-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                      <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A6D56] hover:text-[#4A2E1B]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A6D56] hover:text-[#4A2E1B]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 'success' && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-[#EAF3E7] border-2 border-[#2D5A27]/40 text-[#2D5A27] mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#4A2E1B]">Password Reset Successfully!</h2>
              <p className="text-xs text-[#6D4A32] max-w-xs mx-auto">
                Your password has been securely updated. You can now sign in using your new password.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3 rounded-2xl bg-[#2D5A27] hover:bg-[#1E3E1A] text-white font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
