import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CreditCard,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  Key,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  Package,
  Phone,
  RefreshCw,
  Save,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminProfile = () => {
  const { user, isAdmin, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isSuperAdmin = Boolean(
    isAdmin && (
      user?.adminRoleTitle?.toLowerCase().includes('super') ||
      user?.email?.toLowerCase() === 'admin@mithilamakhana.com' ||
      user?.role === 'superadmin'
    )
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }
  }, [isAuthenticated, isAdmin, user, navigate]);

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      error('Please enter your full name.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileName.trim(),
        phone: profilePhone.trim()
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      error('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      error('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New passwords do not match. Please re-enter.');
      return;
    }
    if (currentPassword === newPassword) {
      error('New password cannot be the same as your current password.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        portal: 'admin'
      });
      if (res?.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPass(false);
        setShowNewPass(false);
        setShowConfirmPass(false);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const sidepanelItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'tracking', label: 'Track Orders', icon: Truck },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'customers', label: 'Customers', icon: User },
    { id: 'admins', label: 'Admins', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'coupons', label: 'Coupons & Offers', icon: Tag }
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col md:flex-row text-[#321F12] antialiased">
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 lg:w-72 bg-[#27170E] text-[#FAF6F0] flex flex-col justify-between border-r border-[#4A2E1B] shadow-2xl transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 border-b border-[#3D2516]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-3 text-left group"
              title="Back to admin dashboard"
            >
              <div className="w-10 h-10 rounded-full bg-[#FAF6F0] p-1 border-2 border-[#D99B26] flex items-center justify-center shadow-md">
                <img
                  src="/images/plain-makhana-bowl.png"
                  alt="Mithila Makhana Motif"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-[#FAF6F0] tracking-tight block leading-tight group-hover:text-[#F3BF58]">
                  Mithila Makhana
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#D99B26] font-bold block pt-0.5">
                  Admin Control Panel
                </span>
              </div>
            </button>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-[#D8C3A5] hover:text-white p-1 rounded-lg hover:bg-[#3D2516]"
              aria-label="Close navigation menu"
            >
              <Menu className="w-5 h-5 rotate-45" />
            </button>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#8A6D56]">
            Store Management
          </div>

          {sidepanelItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate('/admin', { state: { activeTab: item.id } });
                  setMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-[#D8C3A5] hover:bg-[#321F12] hover:text-[#FAF6F0]"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-[#8A6D56]" />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#3D2516] bg-[#1E110A] space-y-3">
          <button
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left bg-[#3D2516] border border-[#D99B26]/50 shadow-sm"
            title="Admin profile"
          >
            <div className="w-9 h-9 rounded-full bg-[#4A2E1B] text-[#D99B26] border border-[#D99B26]/40 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#FAF6F0] truncate">
                {user?.name || 'Mithila Admin'}
              </p>
              <p className="text-[9px] uppercase tracking-wider font-bold text-[#D99B26] truncate">
                Admin Account
              </p>
              <p className="text-[9px] text-[#8A6D56] mt-0.5">
                Profile & security
              </p>
            </div>
            <User className="w-4 h-4 shrink-0 text-[#F3BF58]" />
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      <main className="md:pl-64 lg:pl-72 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#E8DEC9] px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-[#4A2E1B] p-2 rounded-xl bg-white border border-[#E8DEC9] hover:bg-[#FAF6F0]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#4A2E1B] leading-none">
                Admin Profile
              </h1>
              <p className="text-[10px] text-[#8A6D56] pt-0.5">
                Mithila Makhana Management Portal • Bihar Heritage Sourcing
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin')}
            className="hidden sm:inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] text-xs font-bold transition-colors"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-4 h-4 text-[#D99B26]" />
          </button>
        </header>

        <div className="p-4 sm:p-8 space-y-6 flex-1">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#EAF3E7] text-[#2D5A27] text-xs font-bold border border-[#2D5A27]/20">
          <ShieldCheck className="w-4 h-4" />
          <span>{user?.adminRoleTitle || (isSuperAdmin ? 'Super Administrator' : 'Store Administrator')}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DEC9] shadow-soft space-y-6">
            <div className="flex items-center space-x-3 border-b border-[#E8DEC9] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FEF8EA] text-[#B07812] border border-[#D99B26]/25 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold text-[#4A2E1B]">Personal Details</h2>
                <p className="text-[11px] text-[#8A6D56]">Update the name and phone shown for this admin account</p>
              </div>
            </div>

            <form onSubmit={handleSaveAdminProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[#8A6D56]" />
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter administrator name"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DEC9] text-xs font-medium text-[#4A2E1B] focus:outline-none focus:border-[#D99B26] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#8A6D56]" />
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DEC9] text-xs font-medium text-[#4A2E1B] focus:outline-none focus:border-[#D99B26] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8A6D56] mb-1.5">Login Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A89078]" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-[#A89078] mt-1">Email is your unique staff login credential.</p>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin text-[#D99B26]" /> : <Save className="w-4 h-4 text-[#D99B26]" />}
                <span>{savingProfile ? 'Saving Changes...' : 'Save Personal Details'}</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DEC9] shadow-soft space-y-6">
            <div className="flex items-center space-x-3 border-b border-[#E8DEC9] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold text-[#4A2E1B]">Change Password</h2>
                <p className="text-[11px] text-[#8A6D56]">Update only your admin panel password</p>
              </div>
            </div>

            <form onSubmit={handleChangeAdminPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8A6D56]" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current admin password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DEC9] text-xs font-medium text-[#4A2E1B] focus:outline-none focus:border-[#D99B26] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-[#8A6D56] hover:text-[#4A2E1B] p-0.5"
                    tabIndex={-1}
                    aria-label={showCurrentPass ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8A6D56]" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DEC9] text-xs font-medium text-[#4A2E1B] focus:outline-none focus:border-[#D99B26] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-[#8A6D56] hover:text-[#4A2E1B] p-0.5"
                    tabIndex={-1}
                    aria-label={showNewPass ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#8A6D56] mt-1">Must be at least 6 characters long.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#8A6D56]" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DEC9] text-xs font-medium text-[#4A2E1B] focus:outline-none focus:border-[#D99B26] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 text-[#8A6D56] hover:text-[#4A2E1B] p-0.5"
                    tabIndex={-1}
                    aria-label={showConfirmPass ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && confirmPassword && (
                  <div className="mt-1">
                    {newPassword === confirmPassword ? (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Passwords match.</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-600 font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Passwords do not match yet.</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPassword || (newPassword && confirmPassword && newPassword !== confirmPassword)}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F1A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? <RefreshCw className="w-4 h-4 animate-spin text-[#A4E09E]" /> : <CheckCircle2 className="w-4 h-4 text-[#A4E09E]" />}
                <span>{changingPassword ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>

        <div className="bg-[#FAF6F0] rounded-3xl p-5 border border-[#E8DEC9] text-xs text-[#6D4A32]">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-[#D99B26] mt-0.5" />
            <div>
              <p className="font-bold text-[#4A2E1B]">Security note</p>
              <p className="mt-1">Changing this password affects administrator login only. Storefront customer password access remains separate.</p>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;
