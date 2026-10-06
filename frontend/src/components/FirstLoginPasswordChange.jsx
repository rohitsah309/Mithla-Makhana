import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Lock, 
  Key, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  LogOut, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FirstLoginPasswordChange = () => {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { success, error: toastError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your initial temporary password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please re-enter.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('Your new password must be different from your initial password.');
      return;
    }

    setLoading(true);
    const res = await changePassword({ currentPassword, newPassword, portal: 'admin' });
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Failed to update password. Please check your initial password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Icon & Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF8EA] border-2 border-[#D99B26] p-2 mx-auto flex items-center justify-center shadow-soft">
            <Key className="w-7 h-7 text-[#D99B26]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E1B]">
            First-Time Login Security
          </h1>
          <p className="text-xs text-[#8A6D56]">
            Mithila Makhana Administrator Access Control
          </p>
        </div>

        {/* Security Notification Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-5">
          <div className="p-3.5 rounded-2xl bg-[#FEF8EA] border border-[#D99B26]/30 flex items-start space-x-3 text-xs text-[#6D4A32]">
            <ShieldAlert className="w-5 h-5 text-[#B07812] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#4A2E1B] block">Initial Password Change Required</span>
              <span>
                Welcome, <strong>{user?.name}</strong>! Your account was initialized with temporary credentials. You must set a private, permanent password before accessing the Admin Control Panel.
              </span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[11px] text-[#8A6D56] flex justify-between items-center">
            <span>Admin Account:</span>
            <span className="font-bold text-[#4A2E1B]">{user?.email}</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Initial / Current Password */}
            <div>
              <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                Initial / Temporary Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter initial password provided to you"
                  required
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A6D56] hover:text-[#4A2E1B]"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                New Permanent Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A6D56] hover:text-[#4A2E1B]"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirm ? 'text' : 'password'}
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
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A6D56] hover:text-[#4A2E1B]"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Rules Check */}
            <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[11px] text-[#8A6D56] space-y-1">
              <span className="font-bold text-[#4A2E1B] block">Security Rules:</span>
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
              <div className="flex items-center space-x-1.5">
                <span className={newPassword && currentPassword && newPassword !== currentPassword ? 'text-[#2D5A27] font-bold' : 'text-[#8A6D56]'}>
                  {newPassword && currentPassword && newPassword !== currentPassword ? '✓' : '•'} Different from temporary password
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
                  <span>Updating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Save Password & Open Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#E8DEC9]">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/admin/login', { replace: true });
              }}
              className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              <span>Cancel & Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginPasswordChange;
