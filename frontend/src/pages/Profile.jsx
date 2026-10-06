import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  ArrowRight, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Star, 
  Plus, 
  X, 
  Phone, 
  Building,
  Lock,
  Eye,
  EyeOff,
  Key,
  Mail,
  RefreshCw,
  AlertTriangle,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderAPI } from '../services/api';

const Profile = () => {
  const { user, isAuthenticated, logout, updateProfile, changePassword } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'address' | 'profile'

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Address Form State (Used for both Adding & Editing)
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: 'Bihar',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }

    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getMyOrders();
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load user orders', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      error('Please enter your full name.');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ name: editName.trim(), phone: editPhone.trim() });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangeCustomerPassword = async (e) => {
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
        portal: 'customer'
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

  // Start Editing an existing address
  const handleStartEditAddress = (index) => {
    const addr = user.addresses[index];
    if (!addr) return;
    setAddressForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      address: addr.address || '',
      city: addr.city || '',
      state: addr.state || 'Bihar',
      pincode: addr.pincode || '',
      isDefault: Boolean(addr.isDefault)
    });
    setEditingAddressIndex(index);
    // Smooth scroll to address form on mobile/smaller screens
    const formElem = document.getElementById('address-form-section');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingAddressIndex(null);
    setAddressForm({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: 'Bihar',
      pincode: '',
      isDefault: false
    });
  };

  // Save Address (Handles both Create and Edit)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.phone.trim() || !addressForm.address.trim() || !addressForm.city.trim() || !addressForm.pincode.trim()) {
      error('Please fill in all address fields.');
      return;
    }

    const currentAddresses = user.addresses ? [...user.addresses] : [];

    let updatedAddresses = [];

    if (editingAddressIndex !== null) {
      // Editing existing address
      const willBeDefault = addressForm.isDefault || currentAddresses.length === 1;
      
      updatedAddresses = currentAddresses.map((addr, idx) => {
        if (idx === editingAddressIndex) {
          return {
            ...addressForm,
            fullName: addressForm.fullName.trim(),
            phone: addressForm.phone.trim(),
            address: addressForm.address.trim(),
            city: addressForm.city.trim(),
            state: addressForm.state.trim(),
            pincode: addressForm.pincode.trim(),
            isDefault: willBeDefault
          };
        }
        return willBeDefault ? { ...addr, isDefault: false } : addr;
      });

      // Ensure at least one address is marked default
      if (!updatedAddresses.some((a) => a.isDefault) && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      const res = await updateProfile({ addresses: updatedAddresses });
      if (res?.success) {
        success('Address updated successfully!');
        handleCancelEdit();
      }
    } else {
      // Adding new address
      const willBeDefault = addressForm.isDefault || currentAddresses.length === 0;
      const newEntry = {
        ...addressForm,
        fullName: addressForm.fullName.trim(),
        phone: addressForm.phone.trim(),
        address: addressForm.address.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
        isDefault: willBeDefault
      };

      if (willBeDefault) {
        updatedAddresses = currentAddresses.map((addr) => ({ ...addr, isDefault: false }));
        updatedAddresses.push(newEntry);
      } else {
        updatedAddresses = [...currentAddresses, newEntry];
      }

      const res = await updateProfile({ addresses: updatedAddresses });
      if (res?.success) {
        success('New address added successfully!');
        handleCancelEdit();
      }
    }
  };

  // Set an address as default
  const handleSetDefaultAddress = async (index) => {
    if (!user.addresses || !user.addresses[index]) return;
    const target = user.addresses[index];
    if (target.isDefault) return; // Already default

    const updatedAddresses = user.addresses.map((addr, idx) => ({
      ...addr,
      isDefault: idx === index
    }));

    const res = await updateProfile({ addresses: updatedAddresses });
    if (res?.success) {
      success(`"${target.fullName}" set as your default shipping address!`);
    }
  };

  // Delete an address
  const handleDeleteAddress = async (index) => {
    if (!user.addresses || !user.addresses[index]) return;
    const addrToDelete = user.addresses[index];

    if (window.confirm(`Are you sure you want to remove the address for "${addrToDelete.fullName}"?`)) {
      let updatedAddresses = user.addresses.filter((_, idx) => idx !== index);

      // If deleted address was default, make the first remaining address default
      if (addrToDelete.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
      }

      if (editingAddressIndex === index) {
        handleCancelEdit();
      } else if (editingAddressIndex !== null && editingAddressIndex > index) {
        setEditingAddressIndex(editingAddressIndex - 1);
      }

      const res = await updateProfile({ addresses: updatedAddresses });
      if (res?.success) {
        info('Address removed.');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Header */}
      <div className="bg-hero-gradient rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-[#4A2E1B] text-white flex items-center justify-center font-serif text-2xl font-bold border-2 border-[#D99B26]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E1B]">
              {user.name}
            </h1>
            <p className="text-xs text-[#8A6D56]">{user.email}</p>
            {user.phone && (
              <p className="text-xs text-[#6D4A32] font-medium flex items-center space-x-1 mt-0.5">
                <Phone className="w-3 h-3 text-[#D99B26]" />
                <span>{user.phone}</span>
              </p>
            )}
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF3E7] text-[#2D5A27]">
              {user.role === 'admin' ? 'Administrator' : 'Valued Customer'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold shadow-soft flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E8DEC9] pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'orders'
              ? 'bg-[#4A2E1B] text-[#FAF6F0]'
              : 'text-[#6D4A32] hover:bg-[#FAF6F0]'
          }`}
        >
          My Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('address')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'address'
              ? 'bg-[#4A2E1B] text-[#FAF6F0]'
              : 'text-[#6D4A32] hover:bg-[#FAF6F0]'
          }`}
        >
          Saved Addresses ({user.addresses?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'profile'
              ? 'bg-[#4A2E1B] text-[#FAF6F0]'
              : 'text-[#6D4A32] hover:bg-[#FAF6F0]'
          }`}
        >
          Profile & Security
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-8 text-center text-xs text-[#8A6D56]">Loading orders...</div>
          ) : orders.length > 0 ? (
            orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
                  <div>
                    <span className="text-[10px] text-[#8A6D56] uppercase tracking-wider block">
                      Order Reference
                    </span>
                    <span className="font-bold text-sm text-[#4A2E1B]">#{ord.orderId}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-[#8A6D56]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#EAF3E7] text-[#2D5A27] font-bold border border-[#2D5A27]/20">
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#E8DEC9]"
                        />
                        <span className="font-medium text-[#4A2E1B]">{it.name} ({it.weight}) × {it.quantity}</span>
                      </div>
                      <span className="font-bold text-[#4A2E1B]">₹{it.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-[#4A2E1B]">Total: ₹{ord.total}</span>
                  <Link
                    to={`/order-confirmation/${ord.orderId || ord._id}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#D99B26] hover:underline"
                  >
                    <span>View Tracking Journey</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DEC9] space-y-3">
              <Package className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">No Orders Yet</h3>
              <p className="text-xs text-[#8A6D56]">You haven’t placed an order with Mithila Makhana yet.</p>
              <Link to="/shop" className="inline-flex px-6 py-2.5 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] text-xs font-bold">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Addresses with Edit & Default Address Features */}
      {activeTab === 'address' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* List Saved Addresses */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#4A2E1B]">
                  Your Saved Addresses
                </h3>
                <p className="text-xs text-[#8A6D56] mt-0.5">
                  Manage delivery addresses and choose your default shipping destination.
                </p>
              </div>
            </div>

            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-4">
                {user.addresses.map((addr, idx) => {
                  const isBeingEdited = editingAddressIndex === idx;
                  const isDefault = Boolean(addr.isDefault);

                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-soft space-y-3 ${
                        isBeingEdited
                          ? 'border-[#D99B26] ring-2 ring-[#D99B26]/20 bg-[#FEF8EA]/30'
                          : isDefault
                          ? 'border-[#2D5A27]/40 bg-[#FAF6F0]/60'
                          : 'border-[#E8DEC9] hover:border-[#D99B26]/50'
                      }`}
                    >
                      {/* Top Row: Name & Default Badge/Button */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#4A2E1B]">{addr.fullName}</span>
                          {isBeingEdited && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D99B26] text-[#27170E]">
                              Editing Now
                            </span>
                          )}
                        </div>

                        {/* Default Address Badge or Set As Default Action */}
                        <div>
                          {isDefault ? (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EAF3E7] text-[#2D5A27] font-bold text-xs border border-[#2D5A27]/30 shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                              <span>Default Address</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(idx)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#8A6D56] hover:text-[#2D5A27] hover:bg-[#EAF3E7] border border-transparent hover:border-[#2D5A27]/30 transition-all"
                              title="Set as your primary delivery address"
                            >
                              <Star className="w-3.5 h-3.5 text-[#D99B26]" />
                              <span>Set as Default</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Address Content */}
                      <div className="space-y-1 text-xs text-[#6D4A32]">
                        <p className="leading-relaxed text-[#4A2E1B] font-medium">{addr.address}</p>
                        <p>{addr.city}, {addr.state} - <span className="font-bold text-[#4A2E1B]">{addr.pincode}</span></p>
                        <p className="text-[#8A6D56] pt-1 flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#D99B26]" />
                          <span>Phone: <strong className="text-[#4A2E1B]">{addr.phone}</strong></span>
                        </p>
                      </div>

                      {/* Card Actions: Edit & Delete */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditAddress(idx)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-[#E8DEC9] text-[#4A2E1B] hover:bg-[#FAF6F0] text-xs font-bold transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#D99B26]" />
                            <span>Edit Address</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(idx)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Delete</span>
                          </button>
                        </div>

                        {!isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(idx)}
                            className="text-[11px] text-[#2D5A27] font-bold hover:underline hidden sm:inline"
                          >
                            Make Default
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E8DEC9] space-y-3 shadow-soft">
                <MapPin className="w-10 h-10 text-gray-400 mx-auto" />
                <h4 className="font-serif text-lg font-bold text-[#4A2E1B]">No Saved Addresses</h4>
                <p className="text-xs text-[#8A6D56]">
                  Add your home or office address to enable 1-click checkout for your makhana orders.
                </p>
              </div>
            )}
          </div>

          {/* Add / Edit Address Form Section */}
          <div id="address-form-section" className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC9] shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
              <div className="flex items-center space-x-2">
                {editingAddressIndex !== null ? (
                  <>
                    <div className="w-7 h-7 rounded-xl bg-[#FEF8EA] text-[#D99B26] flex items-center justify-center font-bold">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Edit Address</h3>
                      <p className="text-[11px] text-[#8A6D56]">Updating saved shipping details</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-xl bg-[#EAF3E7] text-[#2D5A27] flex items-center justify-center font-bold">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Add New Address</h3>
                      <p className="text-[11px] text-[#8A6D56]">Save a new delivery destination</p>
                    </div>
                  </>
                )}
              </div>

              {editingAddressIndex !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1 text-xs font-bold text-[#8A6D56] hover:text-[#4A2E1B] flex items-center space-x-1 rounded-lg hover:bg-[#FAF6F0]"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">
                  Recipient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="e.g. Rohit Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">
                  Mobile Number (10 Digits) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="e.g. 9812345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">
                  Address / Flat / Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  placeholder="House 402, Lotus Greens, Boring Road"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="e.g. Patna"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    placeholder="e.g. 800001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  placeholder="e.g. Bihar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>

              {/* Set as Default Checkbox */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] hover:bg-[#F3ECE2] transition-colors">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-[#4A2E1B] focus:ring-[#D99B26] w-4 h-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#4A2E1B] block">Set as Default Address</span>
                    <span className="text-[11px] text-[#8A6D56]">
                      Will be pre-selected during checkout
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] text-xs font-bold shadow-soft transition-colors"
                >
                  {editingAddressIndex !== null ? 'Save Changes' : 'Save Address'}
                </button>

                {editingAddressIndex !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-3 rounded-2xl border border-[#E8DEC9] text-[#6D4A32] hover:bg-[#FAF6F0] text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      )}

      {/* Tab 3: Customer Profile & Security */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Two-Column Responsive Layout: Personal Details + Change Password */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CARD 1: Edit Personal & Contact Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-6">
              <div className="flex items-center space-x-3 border-b border-[#E8DEC9] pb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FEF8EA] text-[#D99B26] border border-[#D99B26]/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#B07812]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">Personal & Contact Info</h3>
                  <p className="text-[11px] text-[#8A6D56]">Update your name and delivery contact details</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-[#8A6D56]" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Rohit Kumar"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DEC9] text-xs font-medium text-[#4A2E1B] focus:outline-none focus:border-[#D99B26] focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-[#8A6D56] mt-1">This name appears on your invoices and order receipts.</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                    Phone / Mobile Number <span className="text-[#8A6D56] font-normal">(WhatsApp / SMS)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#8A6D56]" />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DEC9] text-xs font-medium text-[#4A2E1B] focus:outline-none focus:border-[#D99B26] focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-[#8A6D56] mt-1">Used by courier partners for dispatch alerts and delivery coordination.</p>
                </div>

                {/* Email Address (Read-Only) */}
                <div>
                  <label className="block text-xs font-bold text-[#8A6D56] mb-1.5">
                    Registered Email Address (Read-Only)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A89078]" />
                    <input
                      type="email"
                      disabled
                      value={user.email || ''}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-[#A89078] mt-1">Your registered email address cannot be changed directly.</p>
                </div>

                {/* Account Type (Read-Only) */}
                <div>
                  <label className="block text-xs font-bold text-[#8A6D56] mb-1.5">
                    Membership Tier
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-[#2D5A27]" />
                    <input
                      type="text"
                      disabled
                      value={user.role === 'admin' ? 'Store Administrator' : 'Valued Customer (Direct Mithila Member)'}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#EAF3E7]/60 rounded-xl border border-[#2D5A27]/20 text-xs font-bold text-[#2D5A27] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] text-xs font-bold transition-all shadow-soft cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#D99B26]" />
                    ) : (
                      <Save className="w-4 h-4 text-[#D99B26]" />
                    )}
                    <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* CARD 2: Change Account Password */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-6">
              <div className="flex items-center space-x-3 border-b border-[#E8DEC9] pb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#2D5A27]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">Change Customer Password</h3>
                  <p className="text-[11px] text-[#8A6D56]">Keep your shopping account safe • Does not alter any administrator credentials</p>
                </div>
              </div>

              <form onSubmit={handleChangeCustomerPassword} className="space-y-4">
                {/* Current Password */}
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
                      placeholder="Enter your current password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DEC9] text-xs font-medium text-[#4A2E1B] focus:outline-none focus:border-[#D99B26] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-[#8A6D56] hover:text-[#4A2E1B] p-0.5"
                      tabIndex={-1}
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
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
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#8A6D56] mt-1">Must be at least 6 characters with mixed characters.</p>
                </div>

                {/* Confirm New Password */}
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
                      placeholder="Re-enter your new password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F0] rounded-xl border border-[#E8DEC9] text-xs font-medium text-[#4A2E1B] focus:outline-none focus:border-[#D99B26] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-2.5 text-[#8A6D56] hover:text-[#4A2E1B] p-0.5"
                      tabIndex={-1}
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword && confirmPassword && (
                    <div className="mt-1">
                      {newPassword === confirmPassword ? (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Passwords match perfectly!</span>
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword || (newPassword && confirmPassword && newPassword !== confirmPassword)}
                    className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F1A] text-white text-xs font-bold transition-all shadow-soft cursor-pointer disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#A4E09E]" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#A4E09E]" />
                    )}
                    <span>{changingPassword ? 'Updating Password...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Bottom Card: Account Perks & Mithila Heritage Guarantees */}
          <div className="bg-[#FAF6F0] rounded-3xl p-6 sm:p-7 border border-[#E8DEC9] space-y-4">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-[#D99B26]" />
              <h4 className="font-serif text-sm font-bold text-[#4A2E1B]">Mithila Makhana Customer Guarantee & Security</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-4 rounded-2xl border border-[#E8DEC9] space-y-1">
                <p className="font-bold text-[#4A2E1B]">🌾 100% Farm Fresh</p>
                <p className="text-[11px] text-[#8A6D56]">Directly harvested and popped from the pristine wetlands of Bihar.</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E8DEC9] space-y-1">
                <p className="font-bold text-[#4A2E1B]">🚚 Live Tracking</p>
                <p className="text-[11px] text-[#8A6D56]">Instant tracking updates and SMS notifications for all your orders.</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E8DEC9] space-y-1">
                <p className="font-bold text-[#4A2E1B]">💳 100% Safe Payments</p>
                <p className="text-[11px] text-[#8A6D56]">Secured with Razorpay 256-bit encryption & Cash on Delivery options.</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E8DEC9] space-y-1">
                <p className="font-bold text-[#4A2E1B]">🔒 Account Protection</p>
                <p className="text-[11px] text-[#8A6D56]">Your personal data is encrypted and never shared with third parties.</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Profile;
