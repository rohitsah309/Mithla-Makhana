import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  Users, 
  Bell, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowRight,
  Printer, 
  RefreshCw, 
  ShieldCheck, 
  Filter, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle, 
  ChefHat, 
  Save, 
  Minus, 
  Info, 
  IndianRupee,
  ShoppingBag,
  SlidersHorizontal,
  Check,
  Calendar,
  BarChart3,
  TrendingUp,
  UserX,
  UserCheck,
  UserPlus,
  ShieldAlert,
  Key,
  Lock,
  EyeOff,
  User,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI, productAPI, orderAPI, recipeAPI, contactAPI } from '../services/api';
import InvoiceView from '../components/InvoiceView';
import OrderTimeline from '../components/OrderTimeline';

const DEFAULT_STORE_SETTINGS = {
  businessName: 'Mithila Makhana Private Limited',
  brandName: 'Mithila Makhana',
  tagline: 'Authentic Bihar Heritage Fox Nuts',
  operatingAddress: 'Station Road, Near Makhana Research Hub, Darbhanga, Bihar - 846004, India',
  gstin: '10AAAFM1234F1Z5',
  fssai: '10424000000123',
  freeShippingThreshold: 499,
  standardShippingFee: 50,
  supportPhone: '+91 98765 43210',
  supportEmail: 'support@mithilamakhana.com',
  isStoreOpen: true
};

const AVAILABLE_IMAGES = [
  { label: 'Popped Makhana Glass Bowl', url: '/images/plain-makhana-bowl.png' },
  { label: 'Roasted Makhana Glass Jar', url: '/images/roasted-makhana-jar.png' },
  { label: 'Raw Seeds in Jute Bag & Bowl', url: '/images/heritage-seeds-burlap.png' },
  { label: 'Raw Lotus Seeds on Wooden Spoon', url: '/images/makhana-seeds-spoon.png' },
  { label: 'Flavoured Makhana with Cream Dip', url: '/images/cheese-flavoured-dip.png' }
];

const ORDER_STATUS_OPTIONS = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const AdminDashboard = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error, info } = useToast();

  const isSuperAdminUser = (targetUser) => Boolean(
    targetUser && (
      targetUser.adminRoleTitle?.toLowerCase().includes('super') ||
      targetUser.email?.toLowerCase() === 'admin@mithilamakhana.com' ||
      targetUser.role === 'superadmin'
    )
  );

  // Super Administrator Authority Check
  const isSuperAdmin = Boolean(isAdmin && isSuperAdminUser(user));

  // Helper to reliably check if an admin matches current session
  const isCurrentUser = (targetUser) => {
    if (!targetUser || !user) return false;
    const currentEmail = user.email?.trim().toLowerCase();
    const targetEmail = targetUser.email?.trim().toLowerCase();
    if (currentEmail && targetEmail && currentEmail === targetEmail) return true;

    const currentId = user._id || user.id;
    const targetId = targetUser._id || targetUser.id;
    if (currentId && targetId && String(currentId) === String(targetId)) return true;

    return false;
  };

  const isPeerSuperAdmin = (targetUser) => (
    isSuperAdmin &&
    isSuperAdminUser(targetUser) &&
    !isCurrentUser(targetUser)
  );

  // Active Sidepanel Navigation Tab
  // 1. Dashboard, 2. Inventory, 3. Payments, 4. Customers, 5. Notifications, 6. Help & Support, 7. Settings
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core Data States
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState(null);
  const [viewingOrderDetail, setViewingOrderDetail] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'plain',
    price: 249,
    compareAtPrice: 299,
    weight: '250g',
    stock: 100,
    shortDescription: '',
    description: '',
    images: ['/images/plain-makhana-bowl.png'],
    nutrition: {
      calories: '347 kcal per 100g',
      protein: '9.7g',
      carbs: '76.2g',
      fat: '0.1g',
      fiber: '14.5g',
      calcium: '60mg'
    },
    featured: false
  });

  // Recipe Modal
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipeForm, setRecipeForm] = useState({
    title: '',
    description: '',
    image: '/images/roasted-makhana-jar.png',
    prepTime: '10 mins',
    cookTime: '10 mins',
    servings: '2-4 persons',
    difficulty: 'Easy',
    ingredients: '',
    instructions: ''
  });

  // Coupon Modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: '',
    usageLimit: '',
    expiresAt: '',
    isActive: true
  });

  // Sub-tabs & Search States
  const [inventorySubTab, setInventorySubTab] = useState('products'); // 'products' | 'recipes'
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all' | 'razorpay' | 'cod'
  const [paymentSearch, setPaymentSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerRoleFilter, setCustomerRoleFilter] = useState('all'); // 'all' | 'customer' | 'admin'
  const [adminSearch, setAdminSearch] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    adminRoleTitle: 'Store Administrator'
  });
  const [promoteModalUser, setPromoteModalUser] = useState(null);
  const [promoteForm, setPromoteForm] = useState({
    adminRoleTitle: 'Store Administrator',
    setInitialPassword: true,
    initialPassword: ''
  });
  // Super Admin Edit Role Modal
  const [editRoleAdminModal, setEditRoleAdminModal] = useState(null);
  const [editRoleForm, setEditRoleForm] = useState({
    role: 'admin',
    adminRoleTitle: 'Store Administrator',
    resetPassword: false,
    newPassword: ''
  });
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all' | 'stock' | 'orders' | 'messages'
  
  // Orders Section Filters & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // 'all' | ORDER_STATUS_OPTIONS
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all'); // 'all' | 'razorpay' | 'cod' | 'cod-paid' | 'cod-due'
  const [orderSearch, setOrderSearch] = useState('');
  const [orderYearFilter, setOrderYearFilter] = useState('all');
  const [orderMonthFilter, setOrderMonthFilter] = useState('all');

  // Month-wise & Year-wise Analytics States (Dashboard)
  const [analyticsViewMode, setAnalyticsViewMode] = useState('months'); // 'months' | 'years'
  const [selectedYear, setSelectedYear] = useState('all'); // 'all' | '2026' | '2025'
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' | '1'..'12'

  // Month & Year Filter for Payments Section
  const [paymentYearFilter, setPaymentYearFilter] = useState('all');
  const [paymentMonthFilter, setPaymentMonthFilter] = useState('all');

  // Tracking & Logistics Section States
  const [trackingSearch, setTrackingSearch] = useState('');
  const [trackingStatusFilter, setTrackingStatusFilter] = useState('all'); // 'all' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'pending'
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null); // For timeline viewer
  const [trackingModalOrder, setTrackingModalOrder] = useState(null); // For update tracking modal
  const [trackingForm, setTrackingForm] = useState({
    status: 'Shipped',
    courier: 'Delhivery Express',
    trackingNumber: '',
    estimatedDelivery: '',
    notes: ''
  });

  // Settings State (loaded from backend store settings)
  const [storeSettings, setStoreSettings] = useState(DEFAULT_STORE_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin');
      return;
    }
    if (!isAdmin) {
      error('Access denied. Administrator privileges required.');
      navigate('/');
      return;
    }

    loadDashboardData();
    loadStoreSettings();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, prodRes, ordRes, recRes, couponRes, msgRes, usrRes] = await Promise.all([
        adminAPI.getStats(),
        productAPI.getAll(),
        orderAPI.getAllOrders(),
        recipeAPI.getAll(),
        adminAPI.getCoupons(),
        contactAPI.getAllMessages(),
        adminAPI.getUsers()
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (prodRes.data?.success) setProducts(prodRes.data.products);
      if (ordRes.data?.success) setOrders(ordRes.data.orders);
      if (recRes.data?.success) setRecipes(recRes.data.recipes);
      if (couponRes.data?.success) setCoupons(couponRes.data.coupons);
      if (msgRes.data?.success) setMessages(msgRes.data.messages);
      if (usrRes.data?.success) setUsers(usrRes.data.users);
    } catch (err) {
      console.error('Failed to load admin metrics', err);
      error('Error loading dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSignOut = () => {
    logout();
    success('Administrator signed out successfully.');
    navigate('/admin/login', { replace: true });
  };

  // Quick Stock Adjustment (+ or - units directly from table)
  const handleQuickStockChange = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      const res = await productAPI.update(productId, { stock: newStock });
      if (res.data?.success) {
        setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: newStock } : p));
        success(`Stock updated to ${newStock} units`);
      }
    } catch (err) {
      error('Failed to update stock');
    }
  };

  // Product CRUD Handlers
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'plain',
      price: 249,
      compareAtPrice: 299,
      weight: '250g',
      stock: 100,
      shortDescription: '',
      description: '',
      images: ['/images/plain-makhana-bowl.png'],
      nutrition: {
        calories: '347 kcal per 100g',
        protein: '9.7g',
        carbs: '76.9g',
        fat: '0.1g',
        fiber: '14.5g',
        calcium: '60mg'
      },
      featured: false
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || 0,
      weight: prod.weight || '250g',
      stock: prod.stock || 0,
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      images: prod.images || ['/images/plain-makhana-bowl.png'],
      nutrition: prod.nutrition || {
        calories: '347 kcal per 100g',
        protein: '9.7g',
        carbs: '76.9g',
        fat: '0.1g',
        fiber: '14.5g',
        calcium: '60mg'
      },
      featured: Boolean(prod.featured)
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await productAPI.update(editingProduct._id, productForm);
        if (res.data?.success) {
          success('Makhana product updated successfully!');
          setProductModalOpen(false);
          loadDashboardData();
        }
      } else {
        const res = await productAPI.create(productForm);
        if (res.data?.success) {
          success('New Makhana product added to inventory!');
          setProductModalOpen(false);
          loadDashboardData();
        }
      }
    } catch (err) {
      error('Failed to save product details');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from Mithila Makhana inventory?`)) {
      try {
        const res = await productAPI.delete(id);
        if (res.data?.success) {
          success('Product deleted from store.');
          loadDashboardData();
        }
      } catch (err) {
        error('Failed to delete product');
      }
    }
  };

  // Order Status Updates
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await orderAPI.updateStatus(orderId, newStatus, `Status updated by Admin ${user?.name || ''}`);
      if (res.data?.success) {
        success(`Order #${orderId} marked as ${newStatus}`);
        loadDashboardData();
        if (viewingOrderDetail && (viewingOrderDetail.orderId === orderId || viewingOrderDetail._id === orderId)) {
          setViewingOrderDetail(res.data.order);
        }
      }
    } catch (err) {
      error('Failed to update order status');
    }
  };

  // Payment Status Updates (Admin - particularly for COD payment collection)
  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const res = await orderAPI.updatePaymentStatus(
        orderId, 
        newPaymentStatus, 
        `Payment status set to "${newPaymentStatus}" by Admin ${user?.name || ''}`
      );
      if (res.data?.success) {
        success(
          `Order #${orderId} payment updated: ${newPaymentStatus === 'completed' ? '✓ Payment Received' : '⏳ Payment Due'}`
        );
        loadDashboardData();
        if (viewingOrderDetail && (viewingOrderDetail.orderId === orderId || viewingOrderDetail._id === orderId)) {
          setViewingOrderDetail(res.data.order);
        }
      }
    } catch (err) {
      error('Failed to update payment status');
    }
  };

  // Recipe CRUD Handlers
  const handleOpenCreateRecipe = () => {
    setEditingRecipe(null);
    setRecipeForm({
      title: '',
      description: '',
      image: '/images/roasted-makhana-jar.png',
      prepTime: '10 mins',
      cookTime: '10 mins',
      servings: '2-4 persons',
      difficulty: 'Easy',
      ingredients: '',
      instructions: ''
    });
    setRecipeModalOpen(true);
  };

  const handleOpenEditRecipe = (rec) => {
    setEditingRecipe(rec);
    setRecipeForm({
      title: rec.title,
      description: rec.description,
      image: rec.image,
      prepTime: rec.prepTime,
      cookTime: rec.cookTime,
      servings: rec.servings,
      difficulty: rec.difficulty,
      ingredients: rec.ingredients?.join('\n') || '',
      instructions: rec.instructions?.join('\n') || ''
    });
    setRecipeModalOpen(true);
  };

  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    const payload = {
      ...recipeForm,
      ingredients: recipeForm.ingredients.split('\n').filter((l) => l.trim()),
      instructions: recipeForm.instructions.split('\n').filter((l) => l.trim())
    };

    try {
      if (editingRecipe) {
        await recipeAPI.update(editingRecipe._id, payload);
        success('Recipe updated successfully!');
      } else {
        await recipeAPI.create(payload);
        success('New recipe published!');
      }
      setRecipeModalOpen(false);
      loadDashboardData();
    } catch (err) {
      error('Failed to save recipe');
    }
  };

  const handleDeleteRecipe = async (id, title) => {
    if (window.confirm(`Delete recipe "${title}"?`)) {
      try {
        await recipeAPI.delete(id);
        success('Recipe removed.');
        loadDashboardData();
      } catch (err) {
        error('Failed to delete recipe');
      }
    }
  };

  const handleOpenCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      title: '',
      description: '',
      discountType: 'percent',
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscount: '',
      usageLimit: '',
      expiresAt: '',
      isActive: true
    });
    setCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code || '',
      title: coupon.title || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percent',
      discountValue: coupon.discountValue || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount ?? '',
      usageLimit: coupon.usageLimit ?? '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      isActive: coupon.isActive !== false
    });
    setCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    const payload = {
      ...couponForm,
      code: couponForm.code.trim().toUpperCase(),
      maxDiscount: couponForm.maxDiscount === '' ? null : Number(couponForm.maxDiscount),
      usageLimit: couponForm.usageLimit === '' ? null : Number(couponForm.usageLimit),
      expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : null
    };

    try {
      if (editingCoupon) {
        await adminAPI.updateCoupon(editingCoupon._id, payload);
        success('Coupon updated successfully!');
      } else {
        await adminAPI.createCoupon(payload);
        success('New coupon created!');
      }
      setCouponModalOpen(false);
      loadDashboardData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      try {
        await adminAPI.deleteCoupon(id);
        success('Coupon removed.');
        loadDashboardData();
      } catch (err) {
        error('Failed to delete coupon');
      }
    }
  };

  const handleToggleCouponStatus = async (coupon) => {
    try {
      await adminAPI.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}.`);
      loadDashboardData();
    } catch (err) {
      error('Failed to update coupon status');
    }
  };

  const loadStoreSettings = async () => {
    try {
      const res = await adminAPI.getSettings();
      if (res.data?.success && res.data.settings) {
        setStoreSettings({ ...DEFAULT_STORE_SETTINGS, ...res.data.settings });
      }
    } catch (err) {
      console.error('Failed to load store settings', err);
    }
  };

  // Save Settings Handler — persists delivery rules to backend so cart/orders use them
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await adminAPI.updateSettings(storeSettings);
      if (res.data?.success) {
        setStoreSettings({ ...DEFAULT_STORE_SETTINGS, ...res.data.settings });
        try {
          localStorage.setItem('mithila_admin_settings', JSON.stringify(res.data.settings));
        } catch (_) {}
        window.dispatchEvent(new Event('mithila:settings-updated'));
        success('Store settings saved successfully!');
      } else {
        error(res.data?.message || 'Failed to save settings.');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to persist settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // User Block / Unblock Handler (Customers & Staff)
  const handleToggleBlockUser = async (userId, currentBlocked, userName, target = 'customer') => {
    const nextBlocked = !currentBlocked;
    const isTargetAdmin = target === 'admin';
    const targetUser = users.find((u) => String(u._id || u.id) === String(userId));
    if (isTargetAdmin && isPeerSuperAdmin(targetUser)) {
      error('Super Administrators cannot suspend or block each other.');
      return;
    }
    const actionWord = nextBlocked 
      ? (isTargetAdmin ? 'suspend admin access for' : 'block customer access for') 
      : (isTargetAdmin ? 'restore admin access for' : 'unblock customer access for');
    if (!window.confirm(`Are you sure you want to ${actionWord} "${userName}"? ${nextBlocked ? (isTargetAdmin ? 'Their admin portal access will be suspended without affecting their customer shopping account.' : 'Their customer account access will be blocked without affecting their admin privileges.') : 'Access will be restored.'}`)) {
      return;
    }
    try {
      const res = await adminAPI.toggleBlock(userId, nextBlocked, target);
      if (res.data?.success) {
        success(res.data.message || `${isTargetAdmin ? 'Admin access' : 'Customer account'} ${nextBlocked ? 'blocked' : 'restored'} successfully.`);
        const returnedUser = res.data.user;
        setUsers(prev => prev.map(u => {
          if (u._id === userId || u.id === userId) {
            return {
              ...u,
              ...(returnedUser || {}),
              isBlocked: returnedUser?.isBlocked !== undefined ? returnedUser.isBlocked : (!isTargetAdmin ? nextBlocked : u.isBlocked),
              isCustomerBlocked: returnedUser?.isCustomerBlocked !== undefined ? returnedUser.isCustomerBlocked : (!isTargetAdmin ? nextBlocked : u.isCustomerBlocked),
              isAdminBlocked: returnedUser?.isAdminBlocked !== undefined ? returnedUser.isAdminBlocked : (isTargetAdmin ? nextBlocked : u.isAdminBlocked)
            };
          }
          return u;
        }));
      }
    } catch (err) {
      error(err.response?.data?.message || `Failed to ${actionWord} user.`);
    }
  };

  // Admin Account Creation Handler
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      error('Please fill in name, email, and password.');
      return;
    }
    try {
      const res = await adminAPI.createAdmin(adminForm);
      if (res.data?.success) {
        success(res.data.message || 'New administrator account created!');
        setAdminModalOpen(false);
        setAdminForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          adminRoleTitle: 'Store Administrator'
        });
        loadDashboardData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create administrator.');
    }
  };

  // Administrator Account Removal Handler (Super Administrator Only)
  const handleDeleteAdmin = async (adminId, adminName, adminEmail) => {
    if (!isSuperAdmin) {
      error('Access Denied: Only Super Administrators can delete administrator accounts.');
      return;
    }
    const targetAdmin = users.find((u) => String(u._id || u.id) === String(adminId)) || { _id: adminId, email: adminEmail };
    if (isCurrentUser(targetAdmin)) {
      error('You cannot delete your own active administrator account.');
      return;
    }
    if (isPeerSuperAdmin(targetAdmin)) {
      error('Super Administrators cannot delete each other.');
      return;
    }
    if (!window.confirm(`[Super Administrator Action] Permanently revoke and delete administrator "${adminName}" (${adminEmail})? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await adminAPI.deleteUser(adminId);
      if (res.data?.success) {
        success(res.data.message || 'Administrator removed.');
        setUsers(prev => prev.filter(u => u._id !== adminId && u.id !== adminId));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove administrator.');
    }
  };


  
  // Open Edit Role Modal (Super Administrator Only)
  const handleOpenEditRoleModal = (adm) => {
    if (!isSuperAdmin) {
      error('Access Denied: Only Super Administrators can update administrator roles.');
      return;
    }
    if (isPeerSuperAdmin(adm)) {
      error('Super Administrators cannot change each other roles.');
      return;
    }
    setEditRoleAdminModal(adm);
    setEditRoleForm({
      role: adm.role || 'admin',
      adminRoleTitle: adm.adminRoleTitle || 'Store Administrator',
      resetPassword: false,
      newPassword: 'admin_' + Math.floor(100000 + Math.random() * 900000)
    });
  };

  // Save Role Changes Handler (Super Administrator Only)
  const handleSaveEditRole = async (e) => {
    e.preventDefault();
    if (!editRoleAdminModal) return;
    const adminId = editRoleAdminModal._id || editRoleAdminModal.id;

    try {
      const res = await adminAPI.updateRole(adminId, {
        role: editRoleForm.role,
        adminRoleTitle: editRoleForm.role === 'admin' ? editRoleForm.adminRoleTitle : undefined,
        resetPasswordToInitial: editRoleForm.resetPassword,
        password: editRoleForm.resetPassword ? editRoleForm.newPassword : undefined
      });

      if (res.data?.success) {
        success(res.data.message || 'Administrator role updated successfully!');
        setEditRoleAdminModal(null);
        loadDashboardData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update administrator role.');
    }
  };

  // Promote Customer to Administrator (Super Administrator Only)
  const handleOpenPromoteModal = (cust) => {
    if (!isSuperAdmin) {
      error('Access Denied: Only Super Administrators can promote users to administrators.');
      return;
    }
    setPromoteModalUser(cust);
    setPromoteForm({
      adminRoleTitle: 'Store Administrator',
      setInitialPassword: true,
      initialPassword: 'admin_' + Math.floor(100000 + Math.random() * 900000)
    });
  };

  const handleConfirmPromote = async (e) => {
    e.preventDefault();
    if (!promoteModalUser) return;
    const userId = promoteModalUser._id || promoteModalUser.id;

    try {
      const res = await adminAPI.updateRole(userId, {
        role: 'admin',
        adminRoleTitle: promoteForm.adminRoleTitle,
        resetPasswordToInitial: promoteForm.setInitialPassword,
        password: promoteForm.setInitialPassword ? promoteForm.initialPassword : undefined
      });

      if (res.data?.success) {
        success(res.data.message || `Customer "${promoteModalUser.name}" promoted to Administrator!`);
        setPromoteModalUser(null);
        loadDashboardData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to promote user to administrator.');
    }
  };

  // Demote Administrator back to Customer (Super Administrator Only)
  const handleDemoteToCustomer = async (adm) => {
    if (!isSuperAdmin) {
      error('Access Denied: Only Super Administrators can demote administrators.');
      return;
    }
    if (adm.email === 'admin@mithilamakhana.com') {
      error('The primary system Super Administrator cannot be demoted.');
      return;
    }
    if (isPeerSuperAdmin(adm)) {
      error('Super Administrators cannot demote each other.');
      return;
    }
    if (isCurrentUser(adm)) {
      error('You cannot demote your own administrator account.');
      return;
    }
    if (!window.confirm(`[Super Admin Action] Convert "${adm.name}" (${adm.email}) from Administrator to standard Customer? They will lose access to the Admin Dashboard.`)) {
      return;
    }

    try {
      const res = await adminAPI.updateRole(adm._id || adm.id, {
        role: 'customer'
      });
      if (res.data?.success) {
        success(res.data.message || `Administrator "${adm.name}" converted to Customer.`);
        loadDashboardData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change role.');
    }
  };

  // Shipment Tracking Modal & Update Handlers
  const handleOpenTrackingModal = (ord) => {
    const defaultAwb = ord.trackingNumber || `MMTRK${(ord.orderId || ord._id || '').replace(/[^0-9]/g, '').slice(-6) || Math.floor(100000 + Math.random() * 900000)}IN`;
    setTrackingModalOrder(ord);
    setTrackingForm({
      status: ord.orderStatus || 'Shipped',
      courier: ord.courier || 'Delhivery Express',
      trackingNumber: defaultAwb,
      estimatedDelivery: ord.estimatedDelivery || '',
      notes: ''
    });
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    const orderId = trackingModalOrder.orderId || trackingModalOrder._id;

    try {
      const res = await orderAPI.updateStatus(
        orderId,
        trackingForm.status,
        trackingForm.notes || `Dispatched via ${trackingForm.courier} (AWB #${trackingForm.trackingNumber}) by Admin ${user?.name || ''}`,
        {
          courier: trackingForm.courier,
          trackingNumber: trackingForm.trackingNumber,
          estimatedDelivery: trackingForm.estimatedDelivery
        }
      );

      if (res.data?.success) {
        success(`Shipment tracking updated for Order #${orderId}`);
        setTrackingModalOrder(null);
        loadDashboardData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update tracking info');
    }
  };

  // Derived Analytics Data
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const razorpayOrders = orders.filter((o) => o.paymentMethod === 'razorpay' && o.orderStatus !== 'Cancelled');
  const razorpayTotal = razorpayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const codOrders = orders.filter((o) => o.paymentMethod === 'cod' && o.orderStatus !== 'Cancelled');
  const codTotal = codOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const codReceivedOrders = codOrders.filter((o) => o.paymentStatus === 'completed');
  const codReceivedTotal = codReceivedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const codPendingOrders = codOrders.filter((o) => o.paymentStatus !== 'completed');
  const codPendingTotal = codPendingOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const lowStockProducts = products.filter((p) => (p.stock || 0) < 20);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Order Placed' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing');
  const totalAlerts = lowStockProducts.length + pendingOrders.length + messages.length;

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const FULL_MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Distinct Available Years from Orders
  const availableYears = useMemo(() => {
    const years = new Set(orders.map((o) => new Date(o.createdAt || Date.now()).getFullYear().toString()));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [orders]);

  // Dynamic Month-wise Sales Aggregation
  const monthlyAnalyticsData = useMemo(() => {
    const map = {};

    orders.forEach((o) => {
      if (o.orderStatus === 'Cancelled') return;
      const d = new Date(o.createdAt || Date.now());
      const y = d.getFullYear().toString();
      const mIdx = d.getMonth();
      const mNum = String(mIdx + 1).padStart(2, '0');
      const mKey = `${y}-${mNum}`;

      // Apply Year filter if selected
      if (selectedYear !== 'all' && y !== selectedYear) return;
      // Apply Month filter if selected
      if (selectedMonth !== 'all' && (mIdx + 1).toString() !== selectedMonth) return;

      if (!map[mKey]) {
        map[mKey] = {
          key: mKey,
          year: y,
          monthIndex: mIdx,
          monthName: MONTH_NAMES[mIdx],
          fullMonthName: FULL_MONTH_NAMES[mIdx],
          label: `${MONTH_NAMES[mIdx]} ${y}`,
          ordersCount: 0,
          revenue: 0,
          onlineRevenue: 0,
          codRevenue: 0,
          codReceived: 0,
          codPending: 0,
          deliveredCount: 0,
          itemsSold: 0
        };
      }

      const total = Number(o.total || 0);
      const isOnline = o.paymentMethod === 'razorpay';
      const isCod = o.paymentMethod === 'cod';
      const isCodReceived = isCod && o.paymentStatus === 'completed';
      const isCodPending = isCod && o.paymentStatus !== 'completed';
      const itemsCount = (o.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);

      map[mKey].ordersCount += 1;
      map[mKey].revenue += total;
      if (isOnline) map[mKey].onlineRevenue += total;
      if (isCod) {
        map[mKey].codRevenue += total;
        if (isCodReceived) map[mKey].codReceived += total;
        if (isCodPending) map[mKey].codPending += total;
      }
      if (o.orderStatus === 'Delivered') map[mKey].deliveredCount += 1;
      map[mKey].itemsSold += itemsCount;
    });

    return Object.values(map)
      .map(m => ({
        ...m,
        aov: m.ordersCount > 0 ? Math.round(m.revenue / m.ordersCount) : 0
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [orders, selectedYear, selectedMonth]);

  // Dynamic Year-wise Sales Aggregation
  const yearlyAnalyticsData = useMemo(() => {
    const map = {};

    orders.forEach((o) => {
      if (o.orderStatus === 'Cancelled') return;
      const d = new Date(o.createdAt || Date.now());
      const y = d.getFullYear().toString();

      if (!map[y]) {
        map[y] = {
          year: y,
          ordersCount: 0,
          revenue: 0,
          onlineRevenue: 0,
          codRevenue: 0,
          codReceived: 0,
          codPending: 0,
          deliveredCount: 0,
          itemsSold: 0
        };
      }

      const total = Number(o.total || 0);
      const isOnline = o.paymentMethod === 'razorpay';
      const isCod = o.paymentMethod === 'cod';
      const isCodReceived = isCod && o.paymentStatus === 'completed';
      const isCodPending = isCod && o.paymentStatus !== 'completed';
      const itemsCount = (o.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);

      map[y].ordersCount += 1;
      map[y].revenue += total;
      if (isOnline) map[y].onlineRevenue += total;
      if (isCod) {
        map[y].codRevenue += total;
        if (isCodReceived) map[y].codReceived += total;
        if (isCodPending) map[y].codPending += total;
      }
      if (o.orderStatus === 'Delivered') map[y].deliveredCount += 1;
      map[y].itemsSold += itemsCount;
    });

    return Object.values(map)
      .map(y => ({
        ...y,
        aov: y.ordersCount > 0 ? Math.round(y.revenue / y.ordersCount) : 0
      }))
      .sort((a, b) => Number(b.year) - Number(a.year));
  }, [orders]);

  // Aggregated totals for currently selected analytics period
  const selectedPeriodTotals = useMemo(() => {
    const dataList = analyticsViewMode === 'months' ? monthlyAnalyticsData : yearlyAnalyticsData;
    const totalRev = dataList.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrds = dataList.reduce((sum, d) => sum + d.ordersCount, 0);
    const onlineRev = dataList.reduce((sum, d) => sum + d.onlineRevenue, 0);
    const codRev = dataList.reduce((sum, d) => sum + d.codRevenue, 0);
    const codRec = dataList.reduce((sum, d) => sum + d.codReceived, 0);
    const codPend = dataList.reduce((sum, d) => sum + d.codPending, 0);
    const deliv = dataList.reduce((sum, d) => sum + d.deliveredCount, 0);
    const items = dataList.reduce((sum, d) => sum + d.itemsSold, 0);
    const aov = totalOrds > 0 ? Math.round(totalRev / totalOrds) : 0;

    return {
      totalRev,
      totalOrds,
      onlineRev,
      codRev,
      codRec,
      codPend,
      deliv,
      items,
      aov
    };
  }, [analyticsViewMode, monthlyAnalyticsData, yearlyAnalyticsData]);

  // Filtered Products for Inventory
  const filteredProducts = products.filter((p) => {
    const matchesCat = inventoryCategory === 'all' || p.category === inventoryCategory;
    const matchesSearch = !inventorySearch || p.name.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered Payments (Supports Date Filters: Year & Month)
  const filteredPayments = orders.filter((o) => {
    const d = new Date(o.createdAt || Date.now());
    const y = d.getFullYear().toString();
    const m = (d.getMonth() + 1).toString();

    if (paymentYearFilter !== 'all' && y !== paymentYearFilter) return false;
    if (paymentMonthFilter !== 'all' && m !== paymentMonthFilter) return false;

    const matchesMethod = 
      paymentFilter === 'all' ? true :
      paymentFilter === 'razorpay' ? o.paymentMethod === 'razorpay' :
      paymentFilter === 'cod' ? o.paymentMethod === 'cod' :
      paymentFilter === 'cod-received' ? (o.paymentMethod === 'cod' && o.paymentStatus === 'completed') :
      paymentFilter === 'cod-pending' ? (o.paymentMethod === 'cod' && o.paymentStatus !== 'completed') :
      true;
    const matchesSearch = 
      !paymentSearch ||
      o.orderId?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      o.razorpayPaymentId?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(paymentSearch.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  // Payments metrics filtered by period (Year / Month)
  const periodPayments = useMemo(() => {
    return orders.filter((o) => {
      if (o.orderStatus === 'Cancelled') return false;
      const d = new Date(o.createdAt || Date.now());
      const y = d.getFullYear().toString();
      const m = (d.getMonth() + 1).toString();
      if (paymentYearFilter !== 'all' && y !== paymentYearFilter) return false;
      if (paymentMonthFilter !== 'all' && m !== paymentMonthFilter) return false;
      return true;
    });
  }, [orders, paymentYearFilter, paymentMonthFilter]);

  const periodTotalRevenue = useMemo(() => periodPayments.reduce((sum, o) => sum + Number(o.total || 0), 0), [periodPayments]);
  const periodRazorpayOrders = useMemo(() => periodPayments.filter((o) => o.paymentMethod === 'razorpay'), [periodPayments]);
  const periodRazorpayTotal = useMemo(() => periodRazorpayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0), [periodRazorpayOrders]);
  const periodCodOrders = useMemo(() => periodPayments.filter((o) => o.paymentMethod === 'cod'), [periodPayments]);
  const periodCodTotal = useMemo(() => periodCodOrders.reduce((sum, o) => sum + Number(o.total || 0), 0), [periodCodOrders]);
  const periodCodReceivedOrders = useMemo(() => periodCodOrders.filter((o) => o.paymentStatus === 'completed'), [periodCodOrders]);
  const periodCodReceivedTotal = useMemo(() => periodCodReceivedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0), [periodCodReceivedOrders]);
  const periodCodPendingOrders = useMemo(() => periodCodOrders.filter((o) => o.paymentStatus !== 'completed'), [periodCodOrders]);
  const periodCodPendingTotal = useMemo(() => periodCodPendingOrders.reduce((sum, o) => sum + Number(o.total || 0), 0), [periodCodPendingOrders]);

  // Order Fulfillment Counts for Orders Tab (supports date filters)
  const periodOrdersList = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.createdAt || Date.now());
      const y = d.getFullYear().toString();
      const m = (d.getMonth() + 1).toString();
      if (orderYearFilter !== 'all' && y !== orderYearFilter) return false;
      if (orderMonthFilter !== 'all' && m !== orderMonthFilter) return false;
      return true;
    });
  }, [orders, orderYearFilter, orderMonthFilter]);

  const inProgressCount = periodOrdersList.filter((o) => ['Order Placed', 'Confirmed', 'Processing', 'Packed'].includes(o.orderStatus)).length;
  const inTransitCount = periodOrdersList.filter((o) => ['Shipped', 'Out for Delivery'].includes(o.orderStatus)).length;
  const deliveredCount = periodOrdersList.filter((o) => o.orderStatus === 'Delivered').length;

  // Filtered Orders for Dedicated Orders View
  const filteredOrders = orders.filter((o) => {
    const d = new Date(o.createdAt || Date.now());
    const y = d.getFullYear().toString();
    const m = (d.getMonth() + 1).toString();

    if (orderYearFilter !== 'all' && y !== orderYearFilter) return false;
    if (orderMonthFilter !== 'all' && m !== orderMonthFilter) return false;

    const matchesStatus = orderStatusFilter === 'all' ? true : o.orderStatus === orderStatusFilter;
    const matchesPayment = 
      orderPaymentFilter === 'all' ? true :
      orderPaymentFilter === 'razorpay' ? o.paymentMethod === 'razorpay' :
      orderPaymentFilter === 'cod' ? o.paymentMethod === 'cod' :
      orderPaymentFilter === 'cod-paid' ? (o.paymentMethod === 'cod' && o.paymentStatus === 'completed') :
      orderPaymentFilter === 'cod-due' ? (o.paymentMethod === 'cod' && o.paymentStatus !== 'completed') :
      true;
    
    if (!matchesStatus || !matchesPayment) return false;
    if (!orderSearch) return true;

    const q = orderSearch.toLowerCase();
    const orderIdMatch = (o.orderId || o._id || '').toLowerCase().includes(q);
    const nameMatch = (o.shippingAddress?.fullName || o.customer?.name || '').toLowerCase().includes(q);
    const phoneMatch = (o.shippingAddress?.mobile || o.customer?.phone || '').toLowerCase().includes(q);
    const cityMatch = (o.shippingAddress?.city || '').toLowerCase().includes(q);
    const stateMatch = (o.shippingAddress?.state || '').toLowerCase().includes(q);
    const itemMatch = o.items?.some(it => it.name?.toLowerCase().includes(q));

    return orderIdMatch || nameMatch || phoneMatch || cityMatch || stateMatch || itemMatch;
  });

  // Customer Directory includes all registered users (including users promoted to Admin)
  const customerUsers = useMemo(() => users, [users]);
  const adminUsers = useMemo(() => users.filter((u) => u.role === 'admin'), [users]);
  const regularCustomerUsers = useMemo(() => users.filter((u) => u.role !== 'admin'), [users]);

  // Matched existing user for Add Administrator modal
  const matchedExistingCustomer = useMemo(() => {
    if (!adminForm.email) return null;
    return users.find(
      (u) => u.email?.toLowerCase() === adminForm.email.trim().toLowerCase()
    );
  }, [adminForm.email, users]);

  const filteredCustomers = customerUsers.filter((u) => {
    if (customerRoleFilter === 'customer' && u.role === 'admin') return false;
    if (customerRoleFilter === 'admin' && u.role !== 'admin') return false;
    if (customerRoleFilter === 'blocked') {
      const isCustBlocked = Boolean(u.isCustomerBlocked ?? u.isBlocked);
      if (!isCustBlocked) return false;
    }

    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.adminRoleTitle?.toLowerCase().includes(q)
    );
  });

  // Filtered Admins (Super Administrators first, then the logged-in admin)
  const filteredAdmins = useMemo(() => {
    const q = adminSearch.toLowerCase().trim();
    return adminUsers
      .filter((u) => {
        if (!q) return true;
        return (
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.adminRoleTitle?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aSuper = isSuperAdminUser(a);
        const bSuper = isSuperAdminUser(b);
        if (aSuper !== bSuper) return aSuper ? -1 : 1;

        const aSelf = isCurrentUser(a);
        const bSelf = isCurrentUser(b);
        if (aSelf !== bSelf) return aSelf ? -1 : 1;

        return (a.name || a.email || '').localeCompare(b.name || b.email || '');
      });
  }, [adminUsers, adminSearch, user]);

  const inTransitOrdersCount = useMemo(() => {
    return orders.filter((o) => ['Shipped', 'Out for Delivery', 'Processing', 'Packed'].includes(o.orderStatus)).length;
  }, [orders]);

  // Filtered Tracking Shipments
  const filteredTrackingOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (trackingStatusFilter === 'in_transit') {
        if (!['Shipped', 'Processing', 'Packed'].includes(o.orderStatus)) return false;
      } else if (trackingStatusFilter === 'out_for_delivery') {
        if (o.orderStatus !== 'Out for Delivery') return false;
      } else if (trackingStatusFilter === 'delivered') {
        if (o.orderStatus !== 'Delivered') return false;
      } else if (trackingStatusFilter === 'pending') {
        if (!['Order Placed', 'Confirmed'].includes(o.orderStatus)) return false;
      }

      // Search query
      if (trackingSearch.trim()) {
        const q = trackingSearch.toLowerCase().trim();
        const idMatch = (o.orderId || o._id || '').toLowerCase().includes(q);
        const nameMatch = (o.customer?.name || '').toLowerCase().includes(q);
        const phoneMatch = (o.customer?.phone || '').toLowerCase().includes(q);
        const cityMatch = (o.customer?.city || '').toLowerCase().includes(q);
        const courierMatch = (o.courier || '').toLowerCase().includes(q);
        const trackingNumMatch = (o.trackingNumber || '').toLowerCase().includes(q);
        return idMatch || nameMatch || phoneMatch || cityMatch || courierMatch || trackingNumMatch;
      }

      return true;
    });
  }, [orders, trackingStatusFilter, trackingSearch]);

  // Sidepanel Navigation Configuration
  const sidepanelItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.length },
    { id: 'tracking', label: 'Track Orders', icon: Truck, badge: inTransitOrdersCount },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: products.length },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'customers', label: 'Customers', icon: Users, badge: customerUsers.length },
    { id: 'admins', label: 'Admins', icon: ShieldCheck, badge: adminUsers.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, alertCount: totalAlerts },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'coupons', label: 'Coupons & Offers', icon: Tag, badge: coupons.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#D99B26] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#8A6D56] font-medium">Initializing Mithila Makhana Admin Suite...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col md:flex-row text-[#321F12] antialiased">
      
      {/* =========================================================================
          LEFT SIDE SIDEPANEL (Fixed Desktop, Collapsible Drawer on Mobile)
          ========================================================================= */}
      
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 lg:w-72 bg-[#27170E] text-[#FAF6F0] flex flex-col justify-between border-r border-[#4A2E1B] shadow-2xl transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top: Brand & Logo */}
        <div className="p-5 border-b border-[#3D2516]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF6F0] p-1 border-2 border-[#D99B26] flex items-center justify-center shadow-md">
                <img 
                  src="/images/plain-makhana-bowl.png" 
                  alt="Mithila Makhana Motif" 
                  className="object-cover w-full h-full rounded-full"
                />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-[#FAF6F0] tracking-tight block leading-tight">
                  Mithila Makhana
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#D99B26] font-bold block pt-0.5">
                  Admin Control Panel
                </span>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-[#D8C3A5] hover:text-white p-1 rounded-lg hover:bg-[#3D2516]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Navigation Menu (7 Items) */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#8A6D56]">
            Store Management
          </div>

          {sidepanelItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3D2516] text-[#F3BF58] shadow-sm border-l-4 border-[#D99B26] font-bold'
                    : 'text-[#D8C3A5] hover:bg-[#321F12] hover:text-[#FAF6F0]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D99B26]' : 'text-[#8A6D56]'}`} />
                  <span>{item.label}</span>
                </div>

                {/* Badges / Counters */}
                {item.alertCount > 0 ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#D99B26] text-[#27170E] animate-pulse">
                    {item.alertCount}
                  </span>
                ) : item.badge !== undefined ? (
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#3D2516] text-[#D8C3A5]">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Admin profile, session info & sign out */}
        <div className="p-4 border-t border-[#3D2516] bg-[#1E110A] space-y-3">
          <button
            onClick={() => {
              navigate('/admin/profile');
              setMobileSidebarOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer group text-left bg-[#321F12] hover:bg-[#3D2516] border border-[#D99B26]/20"
            title="Open admin profile"
          >
            <div className="w-9 h-9 rounded-full bg-[#4A2E1B] text-[#D99B26] border border-[#D99B26]/40 flex items-center justify-center font-bold text-xs group-hover:border-[#D99B26]">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#FAF6F0] truncate group-hover:text-[#F3BF58] transition-colors">
                {user?.name || 'Mithila Admin'}
              </p>
              <p className="text-[9px] uppercase tracking-wider font-bold text-[#D99B26] truncate">
                Admin Account
              </p>
              <p className="text-[9px] text-[#8A6D56] mt-0.5">
                Edit details & password
              </p>
            </div>
            <User className="w-4 h-4 shrink-0 text-[#8A6D56] group-hover:text-[#D99B26]" />
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

      {/* =========================================================================
          MAIN CONTENT AREA (Right of Sidepanel)
          ========================================================================= */}
      <main className="flex flex-col flex-1 min-h-screen md:pl-64 lg:pl-72">
        
        {/* Top Header Bar */}
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
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#4A2E1B] leading-none capitalize">
                {activeTab === 'tracking' ? 'Track Orders & Shipments' : activeTab === 'help' ? 'Help & Support' : activeTab === 'coupons' ? 'Coupons & Offers' : activeTab}
              </h1>
              <p className="text-[10px] text-[#8A6D56] pt-0.5">
                Mithila Makhana Management Portal • Bihar Heritage Sourcing
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Store Status Pill */}
            <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EAF3E7] text-[#2D5A27] text-xs font-bold border border-[#2D5A27]/20">
              <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse" />
              <span>Store Live & Open</span>
            </div>

            {/* Refresh Data */}
            <button
              onClick={loadDashboardData}
              title="Refresh live metrics"
              className="p-2 rounded-xl bg-white hover:bg-gray-100 border border-[#E8DEC9] text-[#4A2E1B] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#D99B26]' : ''}`} />
            </button>

            {/* Notification Bell Shortcut */}
            <button
              onClick={() => setActiveTab('notifications')}
              title="View system alerts"
              className="relative p-2 rounded-xl bg-white hover:bg-gray-100 border border-[#E8DEC9] text-[#4A2E1B] transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D99B26] text-white font-bold text-[9px] flex items-center justify-center">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Coupons & Offers Shortcut */}
            <button
              onClick={() => setActiveTab('coupons')}
              title="Manage discount coupons and promotional offers"
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                activeTab === 'coupons'
                  ? 'bg-[#3D2516] text-[#F3BF58] border-[#D99B26] shadow-2xs'
                  : 'bg-white hover:bg-[#FAF6F0] border-[#E8DEC9] text-[#4A2E1B]'
              }`}
            >
              <Tag className="w-4 h-4 text-[#D99B26]" />
              <span className="hidden text-xs font-bold sm:inline">Coupons</span>
            </button>

            {/* Quick Add Makhana */}
            <button
              onClick={handleOpenCreateProduct}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D99B26]" />
              <span className="hidden sm:inline">Add Makhana</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Content Views */}
        <div className="flex-1 p-4 space-y-8 sm:p-8">

          {/* =========================================================================
              VIEW 1: DASHBOARD
              ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 duration-200 animate-in fade-in">
              
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                
                {/* Total Revenue */}
                <div className="bg-white rounded-3xl p-5 border border-[#E8DEC9] shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A6D56] uppercase tracking-wider">Total Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-[#FEF8EA] text-[#B07812] flex items-center justify-center">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#4A2E1B]">
                    ₹{totalRevenue}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6D4A32] pt-1 border-t border-gray-100">
                    <span>Razorpay: <strong>₹{razorpayTotal}</strong></span>
                    <span>COD: <strong>₹{codTotal}</strong></span>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-3xl p-5 border border-[#E8DEC9] shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A6D56] uppercase tracking-wider">Total Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-[#EAF3E7] text-[#2D5A27] flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#4A2E1B]">
                    {orders.length}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6D4A32] pt-1 border-t border-gray-100">
                    <span>Delivered: <strong>{orders.filter(o => o.orderStatus === 'Delivered').length}</strong></span>
                    <span className="text-[#B07812]">Pending: <strong>{pendingOrders.length}</strong></span>
                  </div>
                </div>

                {/* Makhana Inventory */}
                <div className="bg-white rounded-3xl p-5 border border-[#E8DEC9] shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A6D56] uppercase tracking-wider">Inventory Stock</span>
                    <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#4A2E1B] flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#4A2E1B]">
                    {products.reduce((acc, p) => acc + (p.stock || 0), 0)} <span className="text-sm font-normal text-[#8A6D56]">packs</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6D4A32] pt-1 border-t border-gray-100">
                    <span>Flavours: <strong>{products.length}</strong></span>
                    {lowStockProducts.length > 0 ? (
                      <span className="font-bold text-red-600">⚠️ {lowStockProducts.length} low stock</span>
                    ) : (
                      <span className="text-[#2D5A27] font-bold">All stock healthy</span>
                    )}
                  </div>
                </div>

                {/* Active Customers */}
                <div className="bg-white rounded-3xl p-5 border border-[#E8DEC9] shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A6D56] uppercase tracking-wider">Registered Users</span>
                    <div className="w-8 h-8 rounded-xl bg-[#F0EAE1] text-[#4A2E1B] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#4A2E1B]">
                    {users.length}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6D4A32] pt-1 border-t border-gray-100">
                    <span>Customers: <strong>{users.filter(u => u.role !== 'admin').length}</strong></span>
                    <span>Admins: <strong>{users.filter(u => u.role === 'admin').length}</strong></span>
                  </div>
                </div>

              </div>

              {/* =========================================================================
                  SALES & REVENUE ANALYTICS (MONTH-WISE & YEAR-WISE PERFORMANCE)
                  ========================================================================= */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-6">
                
                {/* Header Controls: Title, View Switcher, Year/Month Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E8DEC9] pb-4">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FEF8EA] text-[#B07812] flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#4A2E1B]">
                        Sales & Revenue Performance Analytics
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3E7] text-[#2D5A27] text-[10px] font-bold border border-[#2D5A27]/20 uppercase">
                        {analyticsViewMode === 'months' ? 'Monthly Report' : 'Yearly Report'}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A6D56] pt-1">
                      Comprehensive month-wise and year-wise breakdown of sales revenue, order volumes, and payment collections
                    </p>
                  </div>

                  {/* Mode Toggle & Period Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher: Month-Wise vs Year-Wise */}
                    <div className="inline-flex items-center bg-[#FAF6F0] p-1 rounded-2xl border border-[#E8DEC9]">
                      <button
                        onClick={() => setAnalyticsViewMode('months')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          analyticsViewMode === 'months'
                            ? 'bg-[#4A2E1B] text-[#FAF6F0] shadow-2xs'
                            : 'text-[#6D4A32] hover:text-[#4A2E1B]'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#D99B26]" />
                        <span>Month-Wise</span>
                      </button>

                      <button
                        onClick={() => {
                          setAnalyticsViewMode('years');
                          setSelectedMonth('all');
                        }}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          analyticsViewMode === 'years'
                            ? 'bg-[#4A2E1B] text-[#FAF6F0] shadow-2xs'
                            : 'text-[#6D4A32] hover:text-[#4A2E1B]'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-[#D99B26]" />
                        <span>Year-Wise</span>
                      </button>
                    </div>

                    {/* Year Filter */}
                    <div className="flex items-center space-x-1.5">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-bold focus:outline-none focus:border-[#D99B26] cursor-pointer"
                        title="Filter by Year"
                      >
                        <option value="all">All Years</option>
                        {availableYears.map((yr) => (
                          <option key={yr} value={yr}>Year {yr}</option>
                        ))}
                      </select>
                    </div>

                    {/* Month Filter (for Month-Wise Mode) */}
                    {analyticsViewMode === 'months' && (
                      <div className="flex items-center space-x-1.5">
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="px-3 py-1.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-bold focus:outline-none focus:border-[#D99B26] cursor-pointer"
                          title="Filter by Month"
                        >
                          <option value="all">All Months</option>
                          {FULL_MONTH_NAMES.map((name, idx) => (
                            <option key={idx} value={(idx + 1).toString()}>{name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(selectedYear !== 'all' || selectedMonth !== 'all') && (
                      <button
                        onClick={() => {
                          setSelectedYear('all');
                          setSelectedMonth('all');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Selected Period High-Level Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6D56]">Total Revenue</span>
                    <div className="text-xl sm:text-2xl font-bold text-[#4A2E1B]">₹{selectedPeriodTotals.totalRev.toLocaleString('en-IN')}</div>
                    <div className="text-[11px] text-[#2D5A27] font-semibold">Online: ₹{selectedPeriodTotals.onlineRev.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6D56]">Orders Volume</span>
                    <div className="text-xl sm:text-2xl font-bold text-[#4A2E1B]">{selectedPeriodTotals.totalOrds} Orders</div>
                    <div className="text-[11px] text-[#8A6D56]">{selectedPeriodTotals.deliv} successfully delivered</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6D56]">Average Order Value</span>
                    <div className="text-xl sm:text-2xl font-bold text-[#B07812]">₹{selectedPeriodTotals.aov}</div>
                    <div className="text-[11px] text-[#8A6D56]">{selectedPeriodTotals.items} packs dispatched</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6D56]">Cash on Delivery</span>
                    <div className="text-xl sm:text-2xl font-bold text-[#2D5A27]">₹{selectedPeriodTotals.codRec.toLocaleString('en-IN')}</div>
                    <div className="text-[11px] text-[#B07812]">Due / Pending: ₹{selectedPeriodTotals.codPend.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Visual Performance Bar Chart */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#8A6D56]">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#4A2E1B] uppercase tracking-wider">
                        {analyticsViewMode === 'months' ? 'Monthly Revenue & Volume Trend' : 'Year-over-Year Revenue Comparison'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px]">
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A27]" />
                        <span>Online (Razorpay)</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D99B26]" />
                        <span>Cash on Delivery</span>
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar Columns */}
                  <div className="p-4 rounded-2xl bg-[#FAF6F0]/80 border border-[#E8DEC9] overflow-x-auto">
                    {(() => {
                      const dataList = analyticsViewMode === 'months' ? monthlyAnalyticsData : yearlyAnalyticsData;
                      if (dataList.length === 0) {
                        return (
                          <div className="py-8 text-center text-xs text-[#8A6D56]">
                            No sales records available for the selected period.
                          </div>
                        );
                      }
                      const maxVal = Math.max(...dataList.map(d => d.revenue), 100);

                      return (
                        <div className="flex items-end space-x-3 sm:space-x-4 min-w-[500px] h-48 pt-6 pb-2 px-2">
                          {dataList.map((item) => {
                            const barHeightPercent = Math.max(14, Math.round((item.revenue / maxVal) * 100));
                            const onlinePercent = item.revenue > 0 ? (item.onlineRevenue / item.revenue) * 100 : 50;
                            const codPercent = item.revenue > 0 ? (item.codRevenue / item.revenue) * 100 : 50;

                            return (
                              <div key={item.key || item.year} className="flex flex-col items-center justify-end flex-1 h-full group">
                                {/* Value tooltip on hover / top label */}
                                <div className="text-[10px] font-bold text-[#4A2E1B] mb-1 group-hover:text-[#D99B26] transition-colors whitespace-nowrap">
                                  ₹{item.revenue >= 1000 ? `${(item.revenue / 1000).toFixed(1)}k` : item.revenue}
                                </div>

                                {/* Stacked Bar: Online vs COD */}
                                <div 
                                  style={{ height: `${barHeightPercent}%` }}
                                  className="w-full max-w-[48px] rounded-xl overflow-hidden flex flex-col justify-end shadow-2xs border border-[#4A2E1B]/15 group-hover:scale-105 group-hover:shadow-md transition-all cursor-pointer"
                                  title={`${item.label || item.year}: ₹${item.revenue.toLocaleString('en-IN')} (${item.ordersCount} orders)`}
                                >
                                  {/* Online portion (Top green) */}
                                  <div 
                                    style={{ height: `${onlinePercent}%` }}
                                    className="w-full bg-[#2D5A27] transition-all"
                                  />
                                  {/* COD portion (Bottom amber) */}
                                  <div 
                                    style={{ height: `${codPercent}%` }}
                                    className="w-full bg-[#D99B26] transition-all"
                                  />
                                </div>

                                {/* Label Below Bar */}
                                <span className="text-[11px] font-bold text-[#4A2E1B] mt-2 whitespace-nowrap">
                                  {item.monthName ? `${item.monthName} '${item.year.slice(2)}` : `FY ${item.year}`}
                                </span>
                                <span className="text-[9px] font-medium text-[#8A6D56] whitespace-nowrap">
                                  {item.ordersCount} ords
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Detailed Breakdown Data Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#8A6D56]">
                    <span className="font-bold text-[#4A2E1B] uppercase tracking-wider">
                      {analyticsViewMode === 'months' ? 'Month-by-Month Financial Summary' : 'Year-by-Year Financial Summary'}
                    </span>
                    <span>Total {analyticsViewMode === 'months' ? monthlyAnalyticsData.length : yearlyAnalyticsData.length} records</span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[#E8DEC9]">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#4A2E1B]/30 bg-[#FAF6F0] text-[#4A2E1B]">
                          <th className="py-3 px-3.5 font-bold">{analyticsViewMode === 'months' ? 'Month & Year' : 'Financial Year'}</th>
                          <th className="py-3 px-3.5 font-bold text-center">Orders Count</th>
                          <th className="py-3 px-3.5 font-bold">Total Revenue (₹)</th>
                          <th className="py-3 px-3.5 font-bold">Razorpay Online (₹)</th>
                          <th className="py-3 px-3.5 font-bold">COD Total (₹)</th>
                          <th className="py-3 px-3.5 font-bold">COD Collected (₹)</th>
                          <th className="py-3 px-3.5 font-bold text-center">Delivered Orders</th>
                          <th className="py-3 px-3.5 font-bold text-center">Avg Order Value (AOV)</th>
                          <th className="py-3 px-3.5 font-bold text-right">Packs Sold</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DEC9] bg-white">
                        {(analyticsViewMode === 'months' ? monthlyAnalyticsData : yearlyAnalyticsData).map((row) => (
                          <tr key={row.key || row.year} className="hover:bg-[#FAF6F0]/60 transition-colors">
                            <td className="py-3 px-3.5 font-bold text-[#4A2E1B]">
                              <div className="flex items-center space-x-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#D99B26]" />
                                <span>{row.label || `Year ${row.year}`}</span>
                              </div>
                            </td>

                            <td className="py-3 px-3.5 text-center font-bold text-[#4A2E1B]">
                              <span className="px-2 py-0.5 rounded-full bg-[#FAF6F0] border border-[#E8DEC9]">
                                {row.ordersCount}
                              </span>
                            </td>

                            <td className="py-3 px-3.5 font-bold text-sm text-[#4A2E1B]">
                              ₹{row.revenue.toLocaleString('en-IN')}
                            </td>

                            <td className="py-3 px-3.5 text-[#2D5A27] font-semibold">
                              <div>₹{row.onlineRevenue.toLocaleString('en-IN')}</div>
                              <span className="text-[10px] text-[#8A6D56]">
                                {row.revenue > 0 ? Math.round((row.onlineRevenue / row.revenue) * 100) : 0}% of sales
                              </span>
                            </td>

                            <td className="py-3 px-3.5 text-[#B07812] font-semibold">
                              ₹{row.codRevenue.toLocaleString('en-IN')}
                            </td>

                            <td className="py-3 px-3.5 font-semibold">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.codPending === 0
                                  ? 'bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20'
                                  : 'bg-[#FEF8EA] text-[#B07812] border border-[#D99B26]/30'
                              }`}>
                                ✓ ₹{row.codReceived.toLocaleString('en-IN')}
                                {row.codPending > 0 && ` (₹${row.codPending} due)`}
                              </span>
                            </td>

                            <td className="py-3 px-3.5 text-center text-[#2D5A27] font-bold">
                              {row.deliveredCount} / {row.ordersCount}
                            </td>

                            <td className="py-3 px-3.5 text-center font-mono font-bold text-[#4A2E1B]">
                              ₹{row.aov}
                            </td>

                            <td className="py-3 px-3.5 text-right font-bold text-[#4A2E1B]">
                              {row.itemsSold} packs
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Order Status Pipeline Filter Chips */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8DEC9] shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-[#4A2E1B]">
                    Order Fulfillment Pipeline
                  </h3>
                  <span className="text-xs text-[#8A6D56]">Live breakdown across active stages</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4 lg:grid-cols-8">
                  {ORDER_STATUS_OPTIONS.map((status) => {
                    const count = orders.filter(o => o.orderStatus === status).length;
                    return (
                      <div 
                        key={status} 
                        onClick={() => {
                          setOrderStatusFilter(status);
                          setActiveTab('orders');
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer hover:shadow-xs hover:border-[#D99B26] ${
                          count > 0 ? 'bg-[#FAF6F0] border-[#D99B26]/40' : 'bg-gray-50/50 border-gray-200'
                        }`}
                        title={`Filter ${status} orders in Orders section`}
                      >
                        <span className="text-[10px] font-bold text-[#8A6D56] uppercase tracking-wider block truncate">
                          {status}
                        </span>
                        <span className="text-lg font-bold text-[#4A2E1B] block pt-0.5">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Orders Live Table */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DEC9] pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">
                      Recent Customer Orders
                    </h3>
                    <p className="text-xs text-[#8A6D56]">Manage fulfillment and update order statuses on the fly</p>
                  </div>
                  <button
                    onClick={() => {
                      setOrderStatusFilter('all');
                      setActiveTab('orders');
                    }}
                    className="text-xs font-bold text-[#D99B26] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View All Orders ({orders.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8A6D56]">No customer orders recorded yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[#4A2E1B] bg-[#FAF6F0] text-[#4A2E1B]">
                          <th className="px-3 py-3 font-bold">Order ID</th>
                          <th className="px-3 py-3 font-bold">Customer</th>
                          <th className="px-3 py-3 font-bold">Items</th>
                          <th className="px-3 py-3 font-bold">Total</th>
                          <th className="px-3 py-3 font-bold">Payment</th>
                          <th className="px-3 py-3 font-bold">Status</th>
                          <th className="px-3 py-3 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DEC9]">
                        {orders.slice(0, 6).map((ord) => (
                          <tr key={ord._id || ord.orderId} className="hover:bg-[#FAF6F0]/50 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-[#4A2E1B]">
                              #{ord.orderId || ord._id}
                            </td>
                            <td className="px-3 py-3">
                              <div className="font-bold text-[#4A2E1B]">{ord.shippingAddress?.fullName || ord.customer?.name}</div>
                              <div className="text-[10px] text-[#8A6D56]">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</div>
                            </td>
                            <td className="py-3 px-3 text-[#6D4A32]">
                              {ord.items?.map(it => `${it.name} (${it.weight}) × ${it.quantity}`).join(', ') || 'Makhana Pack'}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#4A2E1B]">
                              ₹{ord.total}
                            </td>
                            <td className="px-3 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.paymentMethod === 'razorpay'
                                  ? 'bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20'
                                  : ord.paymentStatus === 'completed'
                                  ? 'bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20'
                                  : 'bg-[#FEF8EA] text-[#B07812] border border-[#D99B26]/30'
                              }`}>
                                {ord.paymentMethod === 'razorpay' ? 'Razorpay' : (ord.paymentStatus === 'completed' ? 'COD (Paid)' : 'COD (Due)')}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(ord.orderId || ord._id, e.target.value)}
                                className="px-2 py-1 text-xs rounded-lg border border-[#E8DEC9] bg-white font-semibold text-[#4A2E1B] cursor-pointer"
                              >
                                {ORDER_STATUS_OPTIONS.map((st) => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="inline-flex items-center space-x-1">
                                <button
                                  onClick={() => setViewingOrderDetail(ord)}
                                  title="View order details"
                                  className="p-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#E8DEC9] text-[#4A2E1B] transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setViewingInvoiceOrder(ord)}
                                  title="Print single-page Tax Invoice"
                                  className="p-1.5 rounded-lg bg-[#2D5A27] hover:bg-[#1E3E1A] text-white transition-colors cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-[#F3BF58]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =========================================================================
              VIEW: ORDERS (Full Order Fulfillment & Order Lifecycle Section)
              ========================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6 duration-200 animate-in fade-in">
              
              {/* Order Fulfillment KPI Metric Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div 
                  onClick={() => setOrderStatusFilter('all')}
                  className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all ${
                    orderStatusFilter === 'all' ? 'border-[#4A2E1B] ring-2 ring-[#4A2E1B]/20 shadow-md' : 'border-[#E8DEC9] hover:border-[#4A2E1B]/40 shadow-soft'
                  }`}
                >
                  <div className="flex items-center justify-between text-[#8A6D56]">
                    <span className="text-xs font-bold tracking-wider uppercase">Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#D99B26]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#4A2E1B] mt-2">{orders.length}</div>
                  <p className="text-[11px] text-[#8A6D56] mt-1">Across all customers & channels</p>
                </div>

                <div 
                  onClick={() => setOrderStatusFilter('Processing')}
                  className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all ${
                    orderStatusFilter === 'Processing' ? 'border-[#B07812] ring-2 ring-[#B07812]/20 shadow-md' : 'border-[#E8DEC9] hover:border-[#B07812]/40 shadow-soft'
                  }`}
                >
                  <div className="flex items-center justify-between text-[#8A6D56]">
                    <span className="text-xs font-bold tracking-wider uppercase">In Progress</span>
                    <Clock className="w-4 h-4 text-[#B07812]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#B07812] mt-2">{inProgressCount}</div>
                  <p className="text-[11px] text-[#8A6D56] mt-1">Placed, Confirmed, Packed</p>
                </div>

                <div 
                  onClick={() => setOrderStatusFilter('Shipped')}
                  className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all ${
                    orderStatusFilter === 'Shipped' ? 'border-[#2D5A27] ring-2 ring-[#2D5A27]/20 shadow-md' : 'border-[#E8DEC9] hover:border-[#2D5A27]/40 shadow-soft'
                  }`}
                >
                  <div className="flex items-center justify-between text-[#8A6D56]">
                    <span className="text-xs font-bold tracking-wider uppercase">In Transit</span>
                    <Truck className="w-4 h-4 text-[#2D5A27]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#2D5A27] mt-2">{inTransitCount}</div>
                  <p className="text-[11px] text-[#8A6D56] mt-1">Shipped & Out for Delivery</p>
                </div>

                <div 
                  onClick={() => setOrderStatusFilter('Delivered')}
                  className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all ${
                    orderStatusFilter === 'Delivered' ? 'border-[#2D5A27] ring-2 ring-[#2D5A27]/20 shadow-md' : 'border-[#E8DEC9] hover:border-[#2D5A27]/40 shadow-soft'
                  }`}
                >
                  <div className="flex items-center justify-between text-[#8A6D56]">
                    <span className="text-xs font-bold tracking-wider uppercase">Delivered</span>
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#2D5A27] mt-2">{deliveredCount}</div>
                  <p className="text-[11px] text-[#8A6D56] mt-1">Successfully fulfilled orders</p>
                </div>
              </div>

              {/* Order Controls: Search, Stage Filter Bar & Payment Filter */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                
                {/* Search Bar & Payment Filter Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search Order ID, customer name, mobile, or city..."
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                    />
                  </div>

                  {/* Year & Month Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-[#8A6D56]">Year:</span>
                      <select
                        value={orderYearFilter}
                        onChange={(e) => setOrderYearFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-semibold focus:outline-none focus:border-[#D99B26] cursor-pointer"
                      >
                        <option value="all">All Years</option>
                        {availableYears.map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-[#8A6D56]">Month:</span>
                      <select
                        value={orderMonthFilter}
                        onChange={(e) => setOrderMonthFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-semibold focus:outline-none focus:border-[#D99B26] cursor-pointer"
                      >
                        <option value="all">All Months</option>
                        {FULL_MONTH_NAMES.map((name, idx) => (
                          <option key={idx} value={(idx + 1).toString()}>{name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Type Quick Filter */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-[#8A6D56] whitespace-nowrap">Payment:</span>
                      <select
                        value={orderPaymentFilter}
                        onChange={(e) => setOrderPaymentFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-semibold focus:outline-none focus:border-[#D99B26] cursor-pointer"
                      >
                        <option value="all">All Payment Methods</option>
                        <option value="razorpay">Razorpay Online</option>
                        <option value="cod">All Cash on Delivery (COD)</option>
                        <option value="cod-paid">COD (Payment Received)</option>
                        <option value="cod-due">COD (Payment Due)</option>
                      </select>
                    </div>

                    {(orderStatusFilter !== 'all' || orderPaymentFilter !== 'all' || orderYearFilter !== 'all' || orderMonthFilter !== 'all' || orderSearch) && (
                      <button
                        onClick={() => {
                          setOrderStatusFilter('all');
                          setOrderPaymentFilter('all');
                          setOrderYearFilter('all');
                          setOrderMonthFilter('all');
                          setOrderSearch('');
                        }}
                        className="px-3 py-1.5 text-xs rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] font-bold transition-colors cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Fulfillment Status Scrollable Filter Chips */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 border-t border-[#E8DEC9]/60">
                  <button
                    onClick={() => setOrderStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      orderStatusFilter === 'all'
                        ? 'bg-[#4A2E1B] text-[#FAF6F0]'
                        : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#E8DEC9]'
                    }`}
                  >
                    All Orders ({orders.length})
                  </button>

                  {ORDER_STATUS_OPTIONS.map((st) => {
                    const count = orders.filter((o) => o.orderStatus === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                          orderStatusFilter === st
                            ? 'bg-[#4A2E1B] text-[#FAF6F0]'
                            : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#E8DEC9]'
                        }`}
                      >
                        <span>{st}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          orderStatusFilter === st ? 'bg-white/20 text-white' : 'bg-white text-[#4A2E1B] border border-[#E8DEC9]'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Orders Management Table */}
                <div className="overflow-x-auto">
                  {filteredOrders.length === 0 ? (
                    <div className="p-12 space-y-3 text-center">
                      <ShoppingBag className="w-10 h-10 text-[#8A6D56]/40 mx-auto" />
                      <p className="text-sm font-bold text-[#4A2E1B]">No matching customer orders found</p>
                      <p className="text-xs text-[#8A6D56]">Try clearing the search query or selecting a different fulfillment status.</p>
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[#4A2E1B] bg-[#FAF6F0] text-[#4A2E1B]">
                          <th className="px-3 py-3 font-bold">Order ID</th>
                          <th className="px-3 py-3 font-bold">Customer & Delivery Details</th>
                          <th className="px-3 py-3 font-bold">Purchased Items</th>
                          <th className="px-3 py-3 font-bold">Total Amount</th>
                          <th className="px-3 py-3 font-bold">Payment Method & Status</th>
                          <th className="px-3 py-3 font-bold">Fulfillment Status</th>
                          <th className="px-3 py-3 font-bold">Order Date</th>
                          <th className="px-3 py-3 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DEC9]">
                        {filteredOrders.map((ord) => (
                          <tr key={ord._id || ord.orderId} className="hover:bg-[#FAF6F0]/50 transition-colors">
                            <td className="px-3 py-3">
                              <button
                                onClick={() => setViewingOrderDetail(ord)}
                                className="font-mono font-bold text-[#4A2E1B] hover:text-[#D99B26] hover:underline cursor-pointer flex items-center space-x-1"
                              >
                                <span>#{ord.orderId || ord._id}</span>
                              </button>
                            </td>

                            <td className="px-3 py-3">
                              <div className="font-bold text-[#4A2E1B]">
                                {ord.shippingAddress?.fullName || ord.customer?.name}
                              </div>
                              <div className="text-[10px] text-[#8A6D56] flex items-center space-x-1 pt-0.5">
                                <Phone className="w-3 h-3" />
                                <span>{ord.shippingAddress?.mobile || ord.customer?.phone || 'N/A'}</span>
                              </div>
                              <div className="text-[10px] text-[#8A6D56]">
                                {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}
                              </div>
                            </td>

                            <td className="max-w-xs px-3 py-3">
                              <div className="space-y-1">
                                {ord.items?.map((it, idx) => (
                                  <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-[#6D4A32]">
                                    <span className="font-bold text-[#4A2E1B]">{it.quantity}x</span>
                                    <span className="truncate">{it.name} ({it.weight})</span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td className="px-3 py-3">
                              <div className="font-bold text-sm text-[#4A2E1B]">₹{ord.total}</div>
                              <div className="text-[10px] text-[#8A6D56]">
                                {ord.items?.reduce((sum, i) => sum + (i.quantity || 1), 0)} items total
                              </div>
                            </td>

                            <td className="px-3 py-3">
                              <div className="space-y-1.5">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  ord.paymentMethod === 'razorpay'
                                    ? 'bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20'
                                    : 'bg-[#FEF8EA] text-[#B07812] border border-[#D99B26]/30'
                                }`}>
                                  {ord.paymentMethod === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery'}
                                </span>

                                {ord.paymentMethod === 'cod' ? (
                                  <div>
                                    <select
                                      value={ord.paymentStatus === 'completed' ? 'completed' : 'pending'}
                                      onChange={(e) => handleUpdatePaymentStatus(ord.orderId || ord._id, e.target.value)}
                                      className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border cursor-pointer ${
                                        ord.paymentStatus === 'completed'
                                          ? 'bg-[#EAF3E7] text-[#2D5A27] border-[#2D5A27]/30'
                                          : 'bg-[#FEF8EA] text-[#B07812] border-[#D99B26]/40'
                                      }`}
                                      title="Update COD Collection"
                                    >
                                      <option value="pending">⏳ Due on Delivery</option>
                                      <option value="completed">✓ Received (Paid)</option>
                                    </select>
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-bold text-[#2D5A27] flex items-center space-x-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Paid Online</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-3 py-3">
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(ord.orderId || ord._id, e.target.value)}
                                className={`px-2.5 py-1 text-xs rounded-xl font-bold border cursor-pointer transition-all ${
                                  ord.orderStatus === 'Delivered'
                                    ? 'bg-[#EAF3E7] text-[#2D5A27] border-[#2D5A27]/30'
                                    : ord.orderStatus === 'Cancelled'
                                    ? 'bg-red-50 text-red-600 border-red-200'
                                    : ord.orderStatus === 'Shipped' || ord.orderStatus === 'Out for Delivery'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-[#FEF8EA] text-[#B07812] border-[#D99B26]/40'
                                }`}
                              >
                                {ORDER_STATUS_OPTIONS.map((st) => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </td>

                            <td className="py-3 px-3 text-[#8A6D56]">
                              <div className="font-medium">
                                {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {new Date(ord.createdAt || Date.now()).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>

                            <td className="px-3 py-3 text-right">
                              <div className="inline-flex items-center space-x-1.5">
                                <button
                                  onClick={() => setViewingOrderDetail(ord)}
                                  className="p-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#E8DEC9] text-[#4A2E1B] transition-colors cursor-pointer"
                                  title="Inspect Order Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setViewingInvoiceOrder(ord)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold transition-colors cursor-pointer"
                                  title="Single-Page A4 Tax Invoice"
                                >
                                  <Printer className="w-3.5 h-3.5 text-[#F3BF58]" />
                                  <span className="hidden sm:inline">Invoice</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* =========================================================================
              VIEW: TRACK SHIPMENTS & ORDERS
              ========================================================================= */}
          {activeTab === 'tracking' && (
            <div className="space-y-6 duration-200 animate-in fade-in">
              
              {/* Shipment Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-[#8A6D56] uppercase tracking-wider block">Total Shipments</span>
                  <p className="text-2xl font-bold font-serif text-[#4A2E1B] mt-1">{orders.length}</p>
                  <span className="text-[10px] text-[#8A6D56]">All registered store parcels</span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-[#B07812] uppercase tracking-wider block">In Transit</span>
                  <p className="text-2xl font-bold font-serif text-[#D99B26] mt-1">
                    {orders.filter((o) => ['Shipped', 'Processing', 'Packed'].includes(o.orderStatus)).length}
                  </p>
                  <span className="text-[10px] text-[#B07812] flex items-center mt-0.5">
                    <Truck className="w-3 h-3 mr-1" /> On courier route
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Out for Delivery</span>
                  <p className="mt-1 font-serif text-2xl font-bold text-blue-800">
                    {orders.filter((o) => o.orderStatus === 'Out for Delivery').length}
                  </p>
                  <span className="text-[10px] text-blue-600 flex items-center mt-0.5">
                    <Clock className="w-3 h-3 mr-1" /> Arriving today
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-[#2D5A27] uppercase tracking-wider block">Delivered</span>
                  <p className="text-2xl font-bold font-serif text-[#2D5A27] mt-1">
                    {orders.filter((o) => o.orderStatus === 'Delivered').length}
                  </p>
                  <span className="text-[10px] text-[#2D5A27] flex items-center mt-0.5">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Reached customers
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Pending Packing</span>
                  <p className="mt-1 font-serif text-2xl font-bold text-amber-700">
                    {orders.filter((o) => ['Order Placed', 'Confirmed'].includes(o.orderStatus)).length}
                  </p>
                  <span className="text-[10px] text-amber-700">Awaiting dispatch</span>
                </div>
              </div>

              {/* Top Controls: Search & Status Filters */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#4A2E1B] flex items-center space-x-2">
                      <Truck className="w-5 h-5 text-[#D99B26]" />
                      <span>Live Parcel & Shipment Tracking Hub</span>
                    </h3>
                    <p className="text-xs text-[#8A6D56]">
                      Monitor courier dispatches, assign AWB numbers, and update delivery milestones
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={trackingSearch}
                      onChange={(e) => setTrackingSearch(e.target.value)}
                      placeholder="Search Order #, AWB, customer, city..."
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                    />
                    {trackingSearch && (
                      <button
                        onClick={() => setTrackingSearch('')}
                        className="absolute text-xs text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-[#8A6D56] mr-1">Filter Shipments:</span>
                  {[
                    { id: 'all', label: 'All Parcels', count: orders.length },
                    { id: 'in_transit', label: 'In Transit', count: orders.filter((o) => ['Shipped', 'Processing', 'Packed'].includes(o.orderStatus)).length },
                    { id: 'out_for_delivery', label: 'Out for Delivery', count: orders.filter((o) => o.orderStatus === 'Out for Delivery').length },
                    { id: 'delivered', label: 'Delivered', count: orders.filter((o) => o.orderStatus === 'Delivered').length },
                    { id: 'pending', label: 'Pending Dispatch', count: orders.filter((o) => ['Order Placed', 'Confirmed'].includes(o.orderStatus)).length }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTrackingStatusFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        trackingStatusFilter === filter.id
                          ? 'bg-[#4A2E1B] text-[#FAF6F0] shadow-xs'
                          : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#F3ECE2] border border-[#E8DEC9]'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Tracking Inspector (Timeline Preview) */}
              {selectedTrackingOrder && (
                <div className="bg-[#FAF6F0] rounded-3xl p-6 border-2 border-[#D99B26]/50 shadow-soft space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DEC9] pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-[#D99B26]/30 text-[#D99B26] flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-[#4A2E1B]">
                            Tracking Journey • Order #{selectedTrackingOrder.orderId || selectedTrackingOrder._id}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            selectedTrackingOrder.orderStatus === 'Delivered'
                              ? 'bg-[#EAF3E7] text-[#2D5A27]'
                              : 'bg-[#FEF8EA] text-[#B07812]'
                          }`}>
                            {selectedTrackingOrder.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-[#8A6D56]">
                          Destination: <strong className="text-[#4A2E1B]">{selectedTrackingOrder.customer?.city || 'India'}, {selectedTrackingOrder.customer?.state || 'Bihar'} ({selectedTrackingOrder.customer?.pincode || '800001'})</strong> • Recipient: {selectedTrackingOrder.customer?.name} ({selectedTrackingOrder.customer?.phone || '—'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenTrackingModal(selectedTrackingOrder)}
                        className="px-3 py-1.5 rounded-xl bg-[#D99B26] hover:bg-[#B07812] text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Tracking</span>
                      </button>
                      <button
                        onClick={() => setSelectedTrackingOrder(null)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-[#4A2E1B] text-xs font-bold border border-[#E8DEC9] cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Courier & AWB Badge Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-[#E8DEC9] text-xs">
                    <div>
                      <span className="text-[10px] text-[#8A6D56] font-bold uppercase block">Courier Partner</span>
                      <span className="font-bold text-[#4A2E1B] flex items-center mt-0.5">
                        <Truck className="w-3.5 h-3.5 mr-1 text-[#D99B26]" />
                        {selectedTrackingOrder.courier || 'Delhivery Express Logistics'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8A6D56] font-bold uppercase block">Consignment / AWB #</span>
                      <span className="font-mono font-bold text-[#4A2E1B] mt-0.5 block">
                        {selectedTrackingOrder.trackingNumber || `MMTRK${(selectedTrackingOrder.orderId || selectedTrackingOrder._id).replace(/[^0-9]/g, '').slice(-6)}IN`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8A6D56] font-bold uppercase block">Est. Delivery</span>
                      <span className="font-semibold text-[#2D5A27] mt-0.5 block">
                        {selectedTrackingOrder.estimatedDelivery || 'Within 2-3 Business Days'}
                      </span>
                    </div>
                  </div>

                  {/* Live Order Timeline */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8DEC9]">
                    <OrderTimeline
                      currentStatus={selectedTrackingOrder.orderStatus}
                      statusHistory={selectedTrackingOrder.statusHistory || []}
                    />
                  </div>
                </div>
              )}

              {/* Shipments Table */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base font-bold text-[#4A2E1B]">
                    Registered Shipments ({filteredTrackingOrders.length})
                  </h4>
                  <span className="text-xs text-[#8A6D56]">Showing dispatch records</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#4A2E1B] bg-[#FAF6F0] text-[#4A2E1B]">
                        <th className="px-3 py-3 font-bold">Order ID</th>
                        <th className="px-3 py-3 font-bold">Recipient & Destination</th>
                        <th className="px-3 py-3 font-bold">Package Details</th>
                        <th className="px-3 py-3 font-bold">Assigned Courier & AWB</th>
                        <th className="px-3 py-3 font-bold text-center">Milestone Status</th>
                        <th className="px-3 py-3 font-bold text-right">Tracking Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DEC9]">
                      {filteredTrackingOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-xs text-[#8A6D56]">
                            No shipments found matching the selected filter or search keyword.
                          </td>
                        </tr>
                      ) : (
                        filteredTrackingOrders.map((ord) => {
                          const awb = ord.trackingNumber || `MMTRK${(ord.orderId || ord._id || '').replace(/[^0-9]/g, '').slice(-6)}IN`;
                          const courierName = ord.courier || 'Delhivery Express';
                          const isDelivered = ord.orderStatus === 'Delivered';
                          const isOut = ord.orderStatus === 'Out for Delivery';
                          const isShipped = ['Shipped', 'Processing', 'Packed'].includes(ord.orderStatus);

                          return (
                            <tr key={ord._id || ord.orderId} className="hover:bg-[#FAF6F0]/60 transition-colors">
                              {/* Order ID */}
                              <td className="py-3 px-3 font-mono font-bold text-[#4A2E1B]">
                                <div>
                                  <span>#{ord.orderId || ord._id}</span>
                                  <span className="block text-[10px] font-sans font-normal text-[#8A6D56]">
                                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </td>

                              {/* Recipient & Destination */}
                              <td className="py-3 px-3 text-[#4A2E1B]">
                                <div className="font-bold text-[#4A2E1B]">{ord.customer?.name || 'Customer'}</div>
                                <div className="text-[11px] text-[#8A6D56] flex items-center space-x-1">
                                  <MapPin className="w-3 h-3 text-[#D99B26] flex-shrink-0" />
                                  <span className="truncate max-w-[180px]">
                                    {ord.customer?.city || 'Patna'}, {ord.customer?.state || 'Bihar'} {ord.customer?.pincode ? `(${ord.customer.pincode})` : ''}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#8A6D56]">{ord.customer?.phone || ''}</div>
                              </td>

                              {/* Package Details */}
                              <td className="px-3 py-3">
                                <span className="font-bold text-[#4A2E1B]">₹{Number(ord.total || 0).toLocaleString('en-IN')}</span>
                                <span className="block text-[10px] text-[#8A6D56]">
                                  {ord.items?.length || 1} product(s)
                                </span>
                              </td>

                              {/* Courier Partner & AWB */}
                              <td className="py-3 px-3 font-medium text-[#4A2E1B]">
                                <div className="flex items-center space-x-1.5">
                                  <Truck className="w-3.5 h-3.5 text-[#D99B26] flex-shrink-0" />
                                  <span className="font-bold">{courierName}</span>
                                </div>
                                <div className="font-mono text-[10px] text-[#8A6D56] mt-0.5">
                                  AWB: {awb}
                                </div>
                              </td>

                              {/* Milestone Status */}
                              <td className="px-3 py-3 text-center">
                                <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  isDelivered
                                    ? 'bg-[#EAF3E7] text-[#2D5A27] border-[#2D5A27]/20'
                                    : isOut
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : isShipped
                                    ? 'bg-[#FEF8EA] text-[#B07812] border-[#D99B26]/30'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}>
                                  {isDelivered ? <CheckCircle2 className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                                  <span>{ord.orderStatus}</span>
                                </span>
                              </td>

                              {/* Tracking Actions */}
                              <td className="px-3 py-3 text-right">
                                <div className="inline-flex items-center space-x-1.5">
                                  <button
                                    onClick={() => setSelectedTrackingOrder(ord)}
                                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 text-[#4A2E1B] text-xs font-bold border border-[#E8DEC9] transition-colors cursor-pointer"
                                    title="View animated milestone journey"
                                  >
                                    Timeline
                                  </button>
                                  <button
                                    onClick={() => handleOpenTrackingModal(ord)}
                                    className="px-2.5 py-1 rounded-lg bg-[#D99B26] hover:bg-[#B07812] text-white text-xs font-bold transition-colors cursor-pointer"
                                    title="Edit courier, AWB, or status"
                                  >
                                    Update
                                  </button>
                                  <button
                                    onClick={() => setViewingInvoiceOrder(ord)}
                                    className="p-1 rounded-lg bg-[#2D5A27] hover:bg-[#1E3E1A] text-white transition-colors cursor-pointer"
                                    title="Print Shipping Invoice"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              VIEW 2: INVENTORY
              ========================================================================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 duration-200 animate-in fade-in">
              
              {/* Top Controls: Search, Category Filter, and Add Button */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">
                      Makhana Inventory & Stock Control
                    </h3>
                    <p className="text-xs text-[#8A6D56]">Manage flavours, price variants, stock levels, and regional recipes</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setInventorySubTab('products')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        inventorySubTab === 'products'
                          ? 'bg-[#4A2E1B] text-[#FAF6F0]'
                          : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#E8DEC9]'
                      }`}
                    >
                      Makhana Products ({products.length})
                    </button>
                    <button
                      onClick={() => setInventorySubTab('recipes')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        inventorySubTab === 'recipes'
                          ? 'bg-[#4A2E1B] text-[#FAF6F0]'
                          : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#E8DEC9]'
                      }`}
                    >
                      Recipes ({recipes.length})
                    </button>
                    <button
                      onClick={inventorySubTab === 'products' ? handleOpenCreateProduct : handleOpenCreateRecipe}
                      className="px-4 py-2 rounded-xl bg-[#D99B26] hover:bg-[#F3BF58] text-[#27170E] text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{inventorySubTab === 'products' ? 'Add Product' : 'Add Recipe'}</span>
                    </button>
                  </div>
                </div>

                {/* Search & Category Filter */}
                {inventorySubTab === 'products' && (
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="Search product flavour by name..."
                        className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                      />
                    </div>

                    <div className="flex items-center pb-1 space-x-1 overflow-x-auto scrollbar-none sm:pb-0">
                      {['all', 'plain', 'roasted', 'masala', 'flavoured', 'sweet', 'raw'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setInventoryCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                            inventoryCategory === cat
                              ? 'bg-[#4A2E1B] text-[#FAF6F0]'
                              : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#E8DEC9]'
                          }`}
                        >
                          {cat === 'all' ? 'All Flavour Categories' : cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-Tab 1: Product Inventory Table */}
              {inventorySubTab === 'products' && (
                <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[#4A2E1B] bg-[#FAF6F0] text-[#4A2E1B]">
                          <th className="px-3 py-3 font-bold">Image</th>
                          <th className="px-3 py-3 font-bold">Product Flavour & Category</th>
                          <th className="px-3 py-3 font-bold">Pack Size</th>
                          <th className="px-3 py-3 font-bold">Price (₹)</th>
                          <th className="px-3 py-3 font-bold text-center">Live Stock (Packs)</th>
                          <th className="px-3 py-3 font-bold text-center">Status</th>
                          <th className="px-3 py-3 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DEC9]">
                        {filteredProducts.map((p) => {
                          const stockCount = p.stock || 0;
                          const isLowStock = stockCount < 20 && stockCount > 0;
                          const isOutOfStock = stockCount === 0;

                          return (
                            <tr key={p._id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                              <td className="px-3 py-3">
                                <img
                                  src={p.images?.[0] || p.image || '/images/plain-makhana-bowl.png'}
                                  alt={p.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-[#E8DEC9] bg-[#FAF6F0]"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <div className="font-bold text-sm text-[#4A2E1B]">{p.name}</div>
                                <div className="flex items-center space-x-2 pt-0.5">
                                  <span className="text-[10px] font-bold text-[#8A6D56] uppercase tracking-wider capitalize">
                                    {p.category}
                                  </span>
                                  {p.featured && (
                                    <span className="px-2 py-0.2 rounded-full bg-[#FEF8EA] text-[#B07812] text-[9px] font-bold border border-[#D99B26]/30">
                                      Featured
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3 font-semibold text-[#6D4A32]">
                                {p.weight || '250g'}
                              </td>
                              <td className="px-3 py-3">
                                <div className="font-bold text-sm text-[#4A2E1B]">₹{p.price}</div>
                                {p.compareAtPrice > p.price && (
                                  <div className="text-[10px] text-gray-400 line-through">₹{p.compareAtPrice}</div>
                                )}
                              </td>
                              <td className="px-3 py-3 text-center">
                                {/* Quick Stock Stepper Buttons */}
                                <div className="inline-flex items-center space-x-1.5 bg-[#FAF6F0] p-1 rounded-xl border border-[#E8DEC9]">
                                  <button
                                    onClick={() => handleQuickStockChange(p._id, stockCount, -5)}
                                    title="Decrease stock by 5"
                                    className="w-6 h-6 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-[#4A2E1B] border border-[#E8DEC9] cursor-pointer"
                                  >
                                    -5
                                  </button>
                                  <button
                                    onClick={() => handleQuickStockChange(p._id, stockCount, -1)}
                                    title="Decrease stock by 1"
                                    className="w-6 h-6 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-[#4A2E1B] border border-[#E8DEC9] cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-mono font-bold text-xs text-[#4A2E1B] min-w-[36px]">
                                    {stockCount}
                                  </span>
                                  <button
                                    onClick={() => handleQuickStockChange(p._id, stockCount, 1)}
                                    title="Increase stock by 1"
                                    className="w-6 h-6 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-[#4A2E1B] border border-[#E8DEC9] cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleQuickStockChange(p._id, stockCount, 10)}
                                    title="Increase stock by 10"
                                    className="w-6 h-6 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center font-bold text-[#4A2E1B] border border-[#E8DEC9] cursor-pointer text-[10px]"
                                  >
                                    +10
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isOutOfStock
                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                    : isLowStock
                                    ? 'bg-[#FEF8EA] text-[#B07812] border border-[#D99B26]/30 animate-pulse'
                                    : 'bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20'
                                }`}>
                                  {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock Warning' : 'In Stock'}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <div className="inline-flex items-center space-x-1.5">
                                  <button
                                    onClick={() => handleOpenEditProduct(p)}
                                    className="p-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#E8DEC9] text-[#4A2E1B] transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p._id, p.name)}
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Recipes Management */}
              {inventorySubTab === 'recipes' && (
                <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recipes.map((rec) => (
                      <div key={rec._id} className="border border-[#E8DEC9] rounded-2xl overflow-hidden bg-[#FAF6F0]/40 flex flex-col justify-between">
                        <img src={rec.image} alt={rec.title} className="object-cover w-full h-40" />
                        <div className="flex flex-col justify-between flex-1 p-4 space-y-2">
                          <div>
                            <h4 className="font-serif text-lg font-bold text-[#4A2E1B]">{rec.title}</h4>
                            <p className="text-xs text-[#6D4A32] line-clamp-2">{rec.description}</p>
                            <div className="flex items-center space-x-3 text-[10px] text-[#8A6D56] pt-2">
                              <span>Prep: {rec.prepTime}</span>
                              <span>Cook: {rec.cookTime}</span>
                              <span>Servings: {rec.servings}</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-[#E8DEC9] flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#2D5A27]">{rec.difficulty}</span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleOpenEditRecipe(rec)}
                                className="p-1.5 rounded-lg bg-white border border-[#E8DEC9] text-[#4A2E1B] hover:bg-gray-100 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRecipe(rec._id, rec.title)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =========================================================================
              VIEW 3: PAYMENTS
              ========================================================================= */}
          {activeTab === 'payments' && (
            <div className="space-y-6 duration-200 animate-in fade-in">
              
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A6D56] uppercase tracking-wider">Total Net Payments</span>
                    {(paymentYearFilter !== 'all' || paymentMonthFilter !== 'all') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6F0] text-[#4A2E1B] border border-[#E8DEC9]">
                        Filtered Period
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-[#4A2E1B]">₹{periodTotalRevenue.toLocaleString('en-IN')}</div>
                  <p className="text-xs text-[#2D5A27] font-semibold">{periodPayments.length} verified orders in selected period</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A6D56] uppercase tracking-wider">Razorpay Gateway (Prepaid)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3E7] text-[#2D5A27]">
                      {periodRazorpayOrders.length} Txns
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[#2D5A27]">₹{periodRazorpayTotal.toLocaleString('en-IN')}</div>
                  <p className="text-xs text-[#8A6D56]">Instant online bank settlement</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A6D56] uppercase tracking-wider">Cash on Delivery (COD)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF8EA] text-[#B07812]">
                      {periodCodOrders.length} Orders
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[#B07812]">₹{periodCodTotal.toLocaleString('en-IN')}</div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
                    <span className="text-[#2D5A27] font-bold">✓ Received: ₹{periodCodReceivedTotal.toLocaleString('en-IN')} ({periodCodReceivedOrders.length})</span>
                    <span className="text-[#B07812] font-bold">⏳ Due: ₹{periodCodPendingTotal.toLocaleString('en-IN')} ({periodCodPendingOrders.length})</span>
                  </div>
                </div>
              </div>

              {/* Payment Filter & Search Bar */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: `All (${periodPayments.length})` },
                      { id: 'razorpay', label: `Razorpay Online (${periodRazorpayOrders.length})` },
                      { id: 'cod', label: `All COD (${periodCodOrders.length})` },
                      { id: 'cod-received', label: `COD Received (${periodCodReceivedOrders.length})` },
                      { id: 'cod-pending', label: `COD Pending (${periodCodPendingOrders.length})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setPaymentFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          paymentFilter === f.id
                            ? 'bg-[#4A2E1B] text-[#FAF6F0]'
                            : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#E8DEC9]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Year Filter */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-[#8A6D56]">Year:</span>
                      <select
                        value={paymentYearFilter}
                        onChange={(e) => setPaymentYearFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-semibold focus:outline-none focus:border-[#D99B26] cursor-pointer"
                      >
                        <option value="all">All Years</option>
                        {availableYears.map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>

                    {/* Month Filter */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-[#8A6D56]">Month:</span>
                      <select
                        value={paymentMonthFilter}
                        onChange={(e) => setPaymentMonthFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-semibold focus:outline-none focus:border-[#D99B26] cursor-pointer"
                      >
                        <option value="all">All Months</option>
                        {FULL_MONTH_NAMES.map((name, idx) => (
                          <option key={idx} value={(idx + 1).toString()}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative w-full sm:w-60">
                      <Search className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={paymentSearch}
                        onChange={(e) => setPaymentSearch(e.target.value)}
                        placeholder="Search txn ID or customer..."
                        className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                      />
                    </div>

                    {(paymentYearFilter !== 'all' || paymentMonthFilter !== 'all' || paymentSearch || paymentFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setPaymentFilter('all');
                          setPaymentYearFilter('all');
                          setPaymentMonthFilter('all');
                          setPaymentSearch('');
                        }}
                        className="px-2.5 py-1.5 text-xs rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] font-bold transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Payments Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#4A2E1B] bg-[#FAF6F0] text-[#4A2E1B]">
                        <th className="px-3 py-3 font-bold">Order ID</th>
                        <th className="px-3 py-3 font-bold">Customer</th>
                        <th className="px-3 py-3 font-bold">Payment Method</th>
                        <th className="px-3 py-3 font-bold">Transaction / Ref ID</th>
                        <th className="px-3 py-3 font-bold">Amount</th>
                        <th className="px-3 py-3 font-bold">Payment Status (Admin Control)</th>
                        <th className="px-3 py-3 font-bold">Date</th>
                        <th className="px-3 py-3 font-bold text-right">Tax Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DEC9]">
                      {filteredPayments.map((ord) => (
                        <tr key={ord._id || ord.orderId} className="hover:bg-[#FAF6F0]/50 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-[#4A2E1B]">
                            #{ord.orderId || ord._id}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#4A2E1B]">
                            {ord.shippingAddress?.fullName || ord.customer?.name}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.paymentMethod === 'razorpay'
                                ? 'bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20'
                                : 'bg-[#FEF8EA] text-[#B07812] border border-[#D99B26]/30'
                            }`}>
                              {ord.paymentMethod === 'razorpay' ? 'Razorpay' : 'COD (Cash)'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#6D4A32]">
                            {ord.razorpayPaymentId || 'COD-AT-DOORSTEP'}
                          </td>
                          <td className="py-3 px-3 font-bold text-sm text-[#4A2E1B]">
                            ₹{ord.total}
                          </td>
                          <td className="px-3 py-3">
                            {ord.paymentMethod === 'cod' ? (
                              <div className="flex items-center space-x-1.5">
                                <select
                                  value={ord.paymentStatus === 'completed' ? 'completed' : 'pending'}
                                  onChange={(e) => handleUpdatePaymentStatus(ord.orderId || ord._id, e.target.value)}
                                  className={`px-2.5 py-1 text-xs font-bold rounded-xl border cursor-pointer transition-all shadow-2xs ${
                                    ord.paymentStatus === 'completed'
                                      ? 'bg-[#EAF3E7] text-[#2D5A27] border-[#2D5A27]/30 hover:border-[#2D5A27]'
                                      : 'bg-[#FEF8EA] text-[#B07812] border-[#D99B26]/40 hover:border-[#D99B26]'
                                  }`}
                                  title="Change COD payment collection status"
                                >
                                  <option value="pending">⏳ Due on Delivery (Pending)</option>
                                  <option value="completed">✓ Payment Received (Paid)</option>
                                </select>
                              </div>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-[#2D5A27] bg-[#EAF3E7] px-2.5 py-1 rounded-full border border-[#2D5A27]/20">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                                <span>PAID ONLINE</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[#8A6D56]">
                            {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={() => setViewingInvoiceOrder(ord)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-white text-[#4A2E1B] border border-[#E8DEC9] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#D99B26]" />
                              <span>View Invoice</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              VIEW 4: CUSTOMERS & USER DIRECTORY (Includes Admin Staff & Customers)
              ========================================================================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6 duration-200 animate-in fade-in">
              
              {/* Customer & User KPIs */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-[#8A6D56] uppercase tracking-wider block">Total Accounts</span>
                  <p className="text-2xl font-bold font-serif text-[#4A2E1B] mt-1">{customerUsers.length}</p>
                  <span className="text-[10px] text-[#8A6D56]">All registered user accounts</span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-[#2D5A27] uppercase tracking-wider block">Retail Customers</span>
                  <p className="text-2xl font-bold font-serif text-[#2D5A27] mt-1">
                    {regularCustomerUsers.length}
                  </p>
                  <span className="text-[10px] text-[#2D5A27]">Consumer shoppers</span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Admin Staff</span>
                  <p className="mt-1 font-serif text-2xl font-bold text-purple-700">
                    {adminUsers.length}
                  </p>
                  <span className="text-[10px] text-purple-600">Store administrators</span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-[#D99B26] uppercase tracking-wider block">Customer Orders</span>
                  <p className="text-2xl font-bold font-serif text-[#D99B26] mt-1">
                    {orders.filter(o => customerUsers.some(c => c.email === o.customer?.email || c.email === o.shippingAddress?.email)).length}
                  </p>
                  <span className="text-[10px] text-[#8A6D56]">Placed by registered users</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">
                      User & Customer Directory
                    </h3>
                    <p className="text-xs text-[#8A6D56]">
                      All customer and administrator accounts • Admins are also accessible under the dedicated Admins section
                    </p>
                  </div>

                  <div className="flex items-center w-full space-x-2 sm:w-80">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Search name, email, role, or mobile..."
                        className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                      />
                    </div>
                    {customerSearch && (
                      <button
                        onClick={() => setCustomerSearch('')}
                        className="px-2.5 py-2 text-xs rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Directory Role Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E8DEC9]/60">
                  <span className="text-xs font-bold text-[#8A6D56] mr-1">Filter Directory:</span>
                  <button
                    onClick={() => setCustomerRoleFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      customerRoleFilter === 'all'
                        ? 'bg-[#4A2E1B] text-white shadow-xs'
                        : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#E8DEC9]/50 border border-[#E8DEC9]'
                    }`}
                  >
                    All Accounts ({customerUsers.length})
                  </button>
                  <button
                    onClick={() => setCustomerRoleFilter('customer')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      customerRoleFilter === 'customer'
                        ? 'bg-[#2D5A27] text-white shadow-xs'
                        : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#E8DEC9]/50 border border-[#E8DEC9]'
                    }`}
                  >
                    Retail Customers ({regularCustomerUsers.length})
                  </button>
                  <button
                    onClick={() => setCustomerRoleFilter('admin')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      customerRoleFilter === 'admin'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#E8DEC9]/50 border border-[#E8DEC9]'
                    }`}
                  >
                    Admin Staff ({adminUsers.length})
                  </button>
                  <button
                    onClick={() => setCustomerRoleFilter('blocked')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      customerRoleFilter === 'blocked'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'bg-[#FAF6F0] text-red-700 hover:bg-red-50 border border-red-200'
                    }`}
                  >
                    Blocked / Inactive ({customerUsers.filter(c => Boolean(c.isCustomerBlocked ?? c.isBlocked)).length})
                  </button>
                </div>

                {/* Customers & Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#4A2E1B] bg-[#FAF6F0] text-[#4A2E1B]">
                        <th className="px-3 py-3 font-bold">User Profile</th>
                        <th className="px-3 py-3 font-bold">Account Role</th>
                        <th className="px-3 py-3 font-bold">Email</th>
                        <th className="px-3 py-3 font-bold">Mobile Phone</th>
                        <th className="px-3 py-3 font-bold text-center">Orders</th>
                        <th className="px-3 py-3 font-bold text-center">Account Status</th>
                        <th className="px-3 py-3 font-bold text-right">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DEC9]">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs text-[#8A6D56]">
                            No user accounts found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((u) => {
                          const userOrders = orders.filter(
                            (o) => o.customer?.email === u.email || o.shippingAddress?.email === u.email
                          );
                          const totalSpend = userOrders
                            .filter(o => o.orderStatus !== 'Cancelled')
                            .reduce((sum, o) => sum + Number(o.total || 0), 0);
                          const isCustBlocked = Boolean(u.isCustomerBlocked ?? u.isBlocked);
                          const isAdminUser = u.role === 'admin';
                          const isPrimarySuperAdmin = u.email === 'admin@mithilamakhana.com';

                          return (
                            <tr
                              key={u._id || u.id || u.email}
                              className={`hover:bg-[#FAF6F0]/50 transition-colors ${isAdminUser ? 'bg-purple-50/20' : ''} ${isCustBlocked ? 'bg-red-50/30' : ''}`}
                            >
                              <td className="px-3 py-3">
                                <div className="flex items-center space-x-2.5">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                    isCustBlocked 
                                      ? 'bg-red-200 text-red-800' 
                                      : isAdminUser
                                      ? 'bg-purple-200 text-purple-900 border border-purple-300'
                                      : 'bg-[#E8DEC9] text-[#4A2E1B]'
                                  }`}>
                                    {isAdminUser ? '👑' : (u.name ? u.name.charAt(0).toUpperCase() : 'C')}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-bold text-[#4A2E1B]">{u.name || 'Anonymous User'}</span>
                                      {isAdminUser && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                          Admin Staff
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-[#8A6D56]">
                                      ID: {(u._id || u.id || '').substring(0, 8)}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-3 py-3">
                                {isAdminUser ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                                    <ShieldCheck className="w-3 h-3 text-purple-600" />
                                    <span>{u.adminRoleTitle || 'Store Administrator'}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                    <span>Retail Customer</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-[#6D4A32] font-mono text-[11px]">{u.email}</td>
                              <td className="py-3 px-3 text-[#6D4A32]">{u.phone || '—'}</td>

                              <td className="px-3 py-3 text-center">
                                <span className="font-bold text-[#4A2E1B]">{userOrders.length}</span>
                                {totalSpend > 0 && (
                                  <span className="block text-[10px] text-[#2D5A27] font-semibold">₹{totalSpend}</span>
                                )}
                              </td>

                              <td className="px-3 py-3 text-center">
                                {isCustBlocked ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                    <AlertTriangle className="w-3 h-3 text-red-600" />
                                    <span>Blocked / Inactive</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20">
                                    <CheckCircle2 className="w-3 h-3 text-[#2D5A27]" />
                                    <span>Active</span>
                                  </span>
                                )}
                              </td>

                              <td className="px-3 py-3 text-right">
                                {isAdminUser ? (
                                  <div className="inline-flex items-center space-x-2">
                                    {!isPrimarySuperAdmin && !isCurrentUser(u) ? (
                                      isCustBlocked ? (
                                        <button
                                          onClick={() => handleToggleBlockUser(u._id || u.id, true, u.name || u.email, 'customer')}
                                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                          title="Restore customer shopping access (admin privileges remain active)"
                                        >
                                          <UserCheck className="w-3.5 h-3.5" />
                                          <span>Unblock Customer</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleToggleBlockUser(u._id || u.id, false, u.name || u.email, 'customer')}
                                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                          title="Block customer shopping access (admin privileges remain active)"
                                        >
                                          <UserX className="w-3.5 h-3.5" />
                                          <span>Block Customer</span>
                                        </button>
                                      )
                                    ) : (
                                      <span className="text-xs text-[#8A6D56] font-medium px-2 py-1">—</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center space-x-2">
                                    <button
                                      onClick={() => handleOpenPromoteModal(u)}
                                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                      title="Promote this customer to Administrator"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                      <span>Make Admin</span>
                                    </button>

                                    {isCustBlocked ? (
                                      <button
                                        onClick={() => handleToggleBlockUser(u._id || u.id, true, u.name || u.email, 'customer')}
                                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                        title="Restore customer account access"
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>Unblock</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleToggleBlockUser(u._id || u.id, false, u.name || u.email, 'customer')}
                                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                        title="Block customer from logging in or placing orders"
                                      >
                                        <UserX className="w-3.5 h-3.5" />
                                        <span>Block</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              VIEW: ADMINS (Dedicated Sidepanel Section)
              ========================================================================= */}
          {activeTab === 'admins' && (
            <div className="space-y-6 duration-200 animate-in fade-in">
              
              {/* Admin KPIs */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-[#8A6D56] uppercase tracking-wider block">Total Administrators</span>
                  <p className="text-2xl font-bold font-serif text-[#4A2E1B] mt-1">{adminUsers.length}</p>
                  <span className="text-[10px] text-[#8A6D56]">Authorized backend staff</span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-[#D99B26] uppercase tracking-wider block">Super Administrators</span>
                  <p className="text-2xl font-bold font-serif text-[#D99B26] mt-1">
                    {adminUsers.filter(a => a.adminRoleTitle?.toLowerCase().includes('super') || a.email === 'admin@mithilamakhana.com').length || 1}
                  </p>
                  <span className="text-[10px] text-[#8A6D56]">Full root system privileges</span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-[#2D5A27] uppercase tracking-wider block">Active Operators</span>
                  <p className="text-2xl font-bold font-serif text-[#2D5A27] mt-1">
                    {adminUsers.filter(a => !Boolean(a.isAdminBlocked ?? (a.isAdminBlocked === undefined && a.isBlocked))).length}
                  </p>
                  <span className="text-[10px] text-[#2D5A27]">Online & verified credentials</span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8DEC9] shadow-soft">
                  <span className="text-[10px] font-bold text-[#4A2E1B] uppercase tracking-wider block">Your Admin Session</span>
                  <p className="text-sm font-bold text-[#4A2E1B] truncate mt-2 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#D99B26]" />
                    <span className="truncate">{user?.name || user?.email}</span>
                  </p>
                  <span className="text-[10px] text-[#2D5A27] font-semibold">Active Secure Session</span>
                </div>
              </div>

              {/* Super Admin Status Banner */}
              {isSuperAdmin ? (
                <div className="p-3.5 rounded-2xl bg-[#FEF8EA] border border-[#D99B26]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-xs text-[#4A2E1B] font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                    <span>Super Administrator Privileges Active</span>
                    <span className="font-normal text-[#8A6D56] text-[11px] hidden md:inline">— You have authority to add staff, update role designations, and delete administrator accounts.</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D99B26] text-white px-2.5 py-0.5 rounded-full inline-block self-start sm:self-auto">
                    Full Root Access
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center space-x-2 text-xs text-gray-600">
                  <ShieldAlert className="flex-shrink-0 w-4 h-4 text-gray-400" />
                  <span><strong>Operator Access:</strong> Role updates and administrator deletion are restricted to Super Administrators.</span>
                </div>
              )}

              <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#4A2E1B] flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-[#D99B26]" />
                      <span>Store Administrators & Team Access</span>
                    </h3>
                    <p className="text-xs text-[#8A6D56]">
                      Manage backend administrators, role designations, and administrative security credentials
                    </p>
                  </div>

                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-[#8A6D56] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Search admin name or email..."
                        className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                      />
                    </div>

                    {isSuperAdmin ? (
                      <button
                        onClick={() => setAdminModalOpen(true)}
                        className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-[#D99B26]" />
                        <span>Add Administrator</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center px-3 py-2 space-x-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-xl" title="Only Super Administrators can create or authorize administrator accounts">
                        <ShieldAlert className="w-4 h-4 text-gray-400" />
                        <span>Super Admin Required</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admins Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#4A2E1B] bg-[#FAF6F0] text-[#4A2E1B]">
                        <th className="px-3 py-3 font-bold">Administrator</th>
                        <th className="px-3 py-3 font-bold">Email (Login)</th>
                        <th className="px-3 py-3 font-bold">Mobile Phone</th>
                        <th className="px-3 py-3 font-bold">Assigned Role</th>
                        <th className="px-3 py-3 font-bold text-center">Status</th>
                        <th className="px-3 py-3 font-bold text-right">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DEC9]">
                      {filteredAdmins.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-xs text-[#8A6D56]">
                            No administrators found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredAdmins.map((adm) => {
                          const isSelf = isCurrentUser(adm);
                          const isAdmBlocked = Boolean(adm.isAdminBlocked ?? (adm.isAdminBlocked === undefined && adm.isBlocked));
                          const isAdmSuper = isSuperAdminUser(adm);
                          const isProtectedPeerSuper = isPeerSuperAdmin(adm);

                          return (
                            <tr key={adm._id || adm.id || adm.email} className={`hover:bg-[#FAF6F0]/50 transition-colors ${isSelf ? 'bg-[#FAF6F0]/60' : ''}`}>
                              <td className="px-3 py-3">
                                <div className="flex items-center space-x-2.5">
                                  <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-[#4A2E1B] text-[#D99B26] border border-[#D99B26]/40 flex items-center justify-center font-bold text-xs">
                                      {adm.name ? adm.name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#2D5A27] rounded-full border border-white" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#4A2E1B] flex items-center space-x-1.5">
                                      <span>{adm.name}</span>
                                      {isSelf && (
                                        <span className="text-[9px] font-bold bg-[#D99B26] text-white px-1.5 py-0.2 rounded-full">
                                          YOU
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[10px] text-[#8A6D56]">
                                      Staff ID: {(adm._id || adm.id || '').substring(0, 8)}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3 font-mono text-[11px] text-[#6D4A32]">
                                {adm.email}
                              </td>

                              <td className="py-3 px-3 text-[#6D4A32]">
                                {adm.phone || '—'}
                              </td>

                              <td className="px-3 py-3">
                                {isAdmSuper ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF8EA] text-[#B07812] border border-[#D99B26]/40 shadow-2xs">
                                    <ShieldCheck className="w-3 h-3 text-[#D99B26]" />
                                    <span>Super Administrator</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    <ShieldAlert className="w-3 h-3 text-blue-500" />
                                    <span>{adm.adminRoleTitle || 'Store Administrator'}</span>
                                  </span>
                                )}
                              </td>

                              <td className="px-3 py-3 text-center">
                                {isAdmBlocked ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                    <AlertTriangle className="w-3 h-3 text-red-600" />
                                    <span>Suspended</span>
                                  </span>
                                ) : adm.mustChangePassword ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300" title="Must change initial password on first login">
                                    <Key className="w-3 h-3 text-amber-600" />
                                    <span>Initial Pass (Pending Change)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20">
                                    <CheckCircle2 className="w-3 h-3 text-[#2D5A27]" />
                                    <span>Active & Verified</span>
                                  </span>
                                )}
                              </td>

                              <td className="px-3 py-3 text-right">
                                {isSelf ? (
                                  <div className="inline-flex items-center space-x-2">
                                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Current Session</span>
                                    </span>
                                    <button
                                      onClick={() => setActiveTab('coupons')}
                                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3EAD8] text-[#4A2E1B] border border-[#D8C3A5] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                      title="Manage discount coupons and offers"
                                    >
                                      <Tag className="w-3.5 h-3.5 text-[#D99B26]" />
                                      <span>Coupons</span>
                                    </button>
                                  </div>
                                ) : isSuperAdmin ? (
                                  isProtectedPeerSuper ? (
                                    <span
                                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#FEF8EA] text-[#8A5B0B] border border-[#D99B26]/40"
                                      title="Super Administrators cannot suspend, block, or delete each other"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5 text-[#D99B26]" />
                                      <span>Protected Super Admin</span>
                                    </span>
                                  ) : (
                                    <div className="inline-flex items-center space-x-1.5">
                                      <button
                                        onClick={() => handleOpenEditRoleModal(adm)}
                                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                        title="Update administrator role designation or privileges"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Update Role</span>
                                      </button>

                                      <button
                                        onClick={() => handleToggleBlockUser(adm._id || adm.id, isAdmBlocked, adm.name || adm.email, 'admin')}
                                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                          isAdmBlocked
                                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                                            : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300'
                                        }`}
                                        title={isAdmBlocked ? 'Restore administrator account (customer account unaffected)' : 'Suspend administrator (customer account unaffected)'}
                                      >
                                        {isAdmBlocked ? 'Unsuspend' : 'Suspend'}
                                      </button>

                                      {adm.email?.toLowerCase() !== 'admin@mithilamakhana.com' && (
                                        <button
                                          onClick={() => handleDeleteAdmin(adm._id || adm.id, adm.name, adm.email)}
                                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                          title="Permanently delete administrator account"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                          <span>Delete</span>
                                        </button>
                                      )}
                                    </div>
                                  )
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200" title="Only Super Administrators can update roles or delete admins">
                                    <ShieldAlert className="w-3 h-3 text-gray-400" />
                                    <span>Super Admin Only</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              VIEW 5: NOTIFICATIONS
              ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 duration-200 animate-in fade-in">
              
              <div className="bg-white rounded-3xl p-6 border border-[#E8DEC9] shadow-soft space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DEC9] pb-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">
                      Operations Notification Center
                    </h3>
                    <p className="text-xs text-[#8A6D56]">Real-time inventory alerts, order fulfillment reminders, and customer messages</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {[
                      { id: 'all', label: `All Alerts (${totalAlerts})` },
                      { id: 'stock', label: `Low Stock (${lowStockProducts.length})` },
                      { id: 'orders', label: `Fulfillment (${pendingOrders.length})` },
                      { id: 'messages', label: `Inquiries (${messages.length})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setNotificationFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          notificationFilter === f.id
                            ? 'bg-[#4A2E1B] text-[#FAF6F0]'
                            : 'bg-[#FAF6F0] text-[#6D4A32] hover:bg-[#E8DEC9]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  
                  {/* Low Stock Alerts */}
                  {(notificationFilter === 'all' || notificationFilter === 'stock') &&
                    lowStockProducts.map((p) => (
                      <div key={p._id} className="p-4 rounded-2xl bg-[#FEF8EA]/70 border border-[#D99B26]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-[#D99B26]/20 text-[#B07812] flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#4A2E1B]">
                              Low Stock Warning: <span className="font-serif text-sm">{p.name}</span>
                            </h4>
                            <p className="text-[11px] text-[#6D4A32]">
                              Current stock: <strong>{p.stock} packs remaining</strong>. Sourcing restock recommended from Mithila growers.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleQuickStockChange(p._id, p.stock || 0, 50)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                        >
                          Quick Restock (+50 Packs)
                        </button>
                      </div>
                    ))}

                  {/* Pending Orders Alerts */}
                  {(notificationFilter === 'all' || notificationFilter === 'orders') &&
                    pendingOrders.map((ord) => (
                      <div key={ord._id || ord.orderId} className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] flex items-center justify-center flex-shrink-0">
                            <Truck className="w-5 h-5 text-[#D99B26]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#4A2E1B]">
                              Fulfillment Due: #{ord.orderId} for {ord.shippingAddress?.fullName}
                            </h4>
                            <p className="text-[11px] text-[#6D4A32]">
                              Status: <span className="font-bold text-[#B07812]">{ord.orderStatus}</span> • Total: <strong>₹{ord.total}</strong> ({ord.items?.length || 1} items)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.orderId || ord._id, 'Packed')}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DEC9] hover:bg-gray-100 text-[#4A2E1B] text-xs font-bold transition-colors cursor-pointer"
                          >
                            Mark Packed
                          </button>
                          <button
                            onClick={() => setViewingInvoiceOrder(ord)}
                            className="px-3 py-1.5 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Print Invoice
                          </button>
                        </div>
                      </div>
                    ))}

                  {/* Customer Inquiries */}
                  {(notificationFilter === 'all' || notificationFilter === 'messages') &&
                    messages.map((msg) => (
                      <div key={msg._id} className="p-4 rounded-2xl bg-white border border-[#E8DEC9] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-[#D99B26]" />
                            <span className="font-bold text-xs text-[#4A2E1B]">{msg.name}</span>
                            <span className="text-[11px] text-[#8A6D56]">({msg.email})</span>
                          </div>
                          <span className="text-[10px] text-[#8A6D56]">
                            {new Date(msg.createdAt || Date.now()).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-[#6D4A32] leading-relaxed pl-6">
                          "{msg.message}"
                        </p>
                        <div className="pt-1 pl-6">
                          <a
                            href={`mailto:${msg.email}?subject=Reply from Mithila Makhana`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-[#D99B26] hover:underline"
                          >
                            <span>Reply to Customer</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}

                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              VIEW 6: HELP & SUPPORT
              ========================================================================= */}
          {activeTab === 'help' && (
            <div className="space-y-6 duration-200 animate-in fade-in">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">
                    Mithila Makhana Admin Help & Support
                  </h3>
                  <p className="text-xs text-[#8A6D56]">Quick guidance for orders, payments, coupons, customers, admin access, and store settings</p>
                </div>

                {/* Support Summary Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1">
                    <span className="text-[10px] font-bold text-[#8A6D56] uppercase">Order Support</span>
                    <p className="text-sm font-bold text-[#2D5A27] flex items-center space-x-1.5">
                      <Truck className="w-4 h-4 text-[#2D5A27]" />
                      <span>Track, pack, ship</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1">
                    <span className="text-[10px] font-bold text-[#8A6D56] uppercase">Payment Help</span>
                    <p className="text-sm font-bold text-[#2D5A27] flex items-center space-x-1.5">
                      <CreditCard className="w-4 h-4 text-[#2D5A27]" />
                      <span>Razorpay & COD</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1">
                    <span className="text-[10px] font-bold text-[#8A6D56] uppercase">Coupons</span>
                    <p className="text-sm font-bold text-[#2D5A27] flex items-center space-x-1.5">
                      <Tag className="w-4 h-4 text-[#2D5A27]" />
                      <span>Offers from database</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1">
                    <span className="text-[10px] font-bold text-[#8A6D56] uppercase">Admin Access</span>
                    <p className="text-sm font-bold text-[#2D5A27] flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                      <span>Roles protected</span>
                    </p>
                  </div>
                </div>

                {/* Operational SOPs */}
                <div className="pt-2 space-y-4">
                  <h4 className="font-serif text-base font-bold text-[#4A2E1B]">
                    Common Admin Workflows
                  </h4>

                  <div className="space-y-3 text-xs text-[#6D4A32]">
                    <div className="p-4 rounded-2xl bg-[#FAF6F0]/70 border border-[#E8DEC9] space-y-1">
                      <strong className="text-[#4A2E1B] block">1. New order received:</strong>
                      <p>Open <strong>Orders</strong>, check customer phone, address, items, and payment status. Move the order from <em>Order Placed</em> to <em>Processing</em> only after stock and payment/COD confirmation are clear.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF6F0]/70 border border-[#E8DEC9] space-y-1">
                      <strong className="text-[#4A2E1B] block">2. Payment or COD issue:</strong>
                      <p>Use <strong>Payments</strong> to verify Razorpay payment ID, COD due amount, and invoice details. For COD orders, confirm the delivery address by phone before dispatch.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF6F0]/70 border border-[#E8DEC9] space-y-1">
                      <strong className="text-[#4A2E1B] block">3. Coupon not applying for customer:</strong>
                      <p>Open <strong>Coupons & Offers</strong> and check that the coupon is active, not expired, and meets the minimum order value. Customers can apply or remove coupons from cart and checkout.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF6F0]/70 border border-[#E8DEC9] space-y-1">
                      <strong className="text-[#4A2E1B] block">4. Customer or admin account problem:</strong>
                      <p>Use <strong>Customers</strong> to unblock shopping access. Use <strong>Admins</strong> for staff roles, password resets, and suspension. Super Administrators are protected from being suspended or deleted by each other.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF6F0]/70 border border-[#E8DEC9] space-y-1">
                      <strong className="text-[#4A2E1B] block">5. Delivery fee, store status, or business details:</strong>
                      <p>Open <strong>Settings</strong> to update store open/closed status, free delivery minimum, flat delivery fee, support phone, support email, GSTIN, FSSAI, and address details.</p>
                    </div>
                  </div>
                </div>

                {/* Support Hotline */}
                <div className="p-5 rounded-2xl bg-[#27170E] text-[#FAF6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="font-serif text-base font-bold">Need Help With an Urgent Store Issue?</h5>
                    <p className="text-xs text-[#D8C3A5]">Contact store support for failed payments, wrong order details, login issues, or coupon problems.</p>
                  </div>
                  <div className="text-xs font-mono font-bold text-[#D99B26] text-left sm:text-right space-y-1">
                    <div>{storeSettings.supportEmail || 'support@mithilamakhana.com'}</div>
                    <div>{storeSettings.supportPhone || '+91 98765 43210'}</div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* =========================================================================
              VIEW 7: SETTINGS
              ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 duration-200 animate-in fade-in">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-soft space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">
                    Mithila Makhana Business & Store Settings
                  </h3>
                  <p className="text-xs text-[#8A6D56]">Configure store identity, legal registrations, delivery rules, and emergency controls</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  {/* Business Profile */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6D56]">
                      Business Profile Details
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Company Legal Name</label>
                        <input
                          type="text"
                          value={storeSettings.businessName}
                          onChange={(e) => setStoreSettings({ ...storeSettings, businessName: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Brand Name</label>
                        <input
                          type="text"
                          value={storeSettings.brandName}
                          onChange={(e) => setStoreSettings({ ...storeSettings, brandName: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Operating Hub Address (Bihar)</label>
                      <input
                        type="text"
                        value={storeSettings.operatingAddress}
                        onChange={(e) => setStoreSettings({ ...storeSettings, operatingAddress: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                        required
                      />
                    </div>
                  </div>

                  {/* Government Registrations */}
                  <div className="pt-3 space-y-3 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6D56]">
                      Government Tax & Food Registrations
                    </h4>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-[#4A2E1B] block mb-1">GSTIN (State Code: 10 - Bihar)</label>
                        <input
                          type="text"
                          value={storeSettings.gstin}
                          onChange={(e) => setStoreSettings({ ...storeSettings, gstin: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] font-mono text-[#4A2E1B]"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#4A2E1B] block mb-1">FSSAI Central Food License</label>
                        <input
                          type="text"
                          value={storeSettings.fssai}
                          onChange={(e) => setStoreSettings({ ...storeSettings, fssai: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] font-mono text-[#4A2E1B]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Shipping Thresholds */}
                  <div className="pt-3 space-y-3 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6D56]">
                      Delivery Rules & Thresholds
                    </h4>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Free Delivery Minimum Order (₹)</label>
                        <input
                          type="number"
                          value={storeSettings.freeShippingThreshold ?? ''}
                          onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Standard Flat Delivery Fee (₹)</label>
                        <input
                          type="number"
                          value={storeSettings.standardShippingFee ?? ''}
                          onChange={(e) => setStoreSettings({ ...storeSettings, standardShippingFee: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Care Contacts */}
                  <div className="pt-3 space-y-3 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6D56]">
                      Customer Support Contacts
                    </h4>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Helpline Phone Number</label>
                        <input
                          type="text"
                          value={storeSettings.supportPhone}
                          onChange={(e) => setStoreSettings({ ...storeSettings, supportPhone: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Support Email Address</label>
                        <input
                          type="email"
                          value={storeSettings.supportEmail}
                          onChange={(e) => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4 text-[#D99B26]" />
                      <span>{isSavingSettings ? 'Saving…' : 'Save Store Settings'}</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

          {/* =========================================================================
              VIEW 11: COUPONS & OFFERS
              ========================================================================= */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 duration-200 animate-in fade-in">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#4A2E1B]">Coupons & Promotional Offers</h3>
                  <p className="text-xs text-[#8A6D56]">Create and manage discount codes used by customers at checkout</p>
                </div>
                <button
                  onClick={handleOpenCreateCoupon}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D99B26]" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8DEC9] shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#FAF6F0] border-b border-[#E8DEC9]">
                      <tr>
                        <th className="text-left py-3 px-4 font-bold text-[#4A2E1B]">Code</th>
                        <th className="text-left py-3 px-4 font-bold text-[#4A2E1B]">Offer</th>
                        <th className="text-left py-3 px-4 font-bold text-[#4A2E1B]">Discount</th>
                        <th className="text-left py-3 px-4 font-bold text-[#4A2E1B]">Min Order</th>
                        <th className="text-left py-3 px-4 font-bold text-[#4A2E1B]">Usage</th>
                        <th className="text-left py-3 px-4 font-bold text-[#4A2E1B]">Status</th>
                        <th className="text-right py-3 px-4 font-bold text-[#4A2E1B]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 px-4 text-center text-[#8A6D56]">
                            No coupons yet. Create your first offer to boost sales.
                          </td>
                        </tr>
                      ) : (
                        coupons.map((coupon) => (
                          <tr key={coupon._id} className="border-b border-[#F3EAD8] hover:bg-[#FAF6F0]/60">
                            <td className="px-4 py-3">
                              <span className="font-mono font-bold text-[#4A2E1B] bg-[#FEF8EA] px-2 py-1 rounded-lg border border-[#D99B26]/20">
                                {coupon.code}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-[#4A2E1B]">{coupon.title}</p>
                              {coupon.description && (
                                <p className="text-[10px] text-[#8A6D56] mt-0.5 line-clamp-1">{coupon.description}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#2D5A27]">
                              {coupon.discountType === 'fixed'
                                ? `₹${coupon.discountValue} off`
                                : `${coupon.discountValue}% off`}
                            </td>
                            <td className="py-3 px-4 text-[#6D4A32]">
                              {Number(coupon.minOrderAmount) > 0 ? `₹${coupon.minOrderAmount}` : '—'}
                            </td>
                            <td className="py-3 px-4 text-[#6D4A32]">
                              {coupon.usedCount || 0}
                              {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ''}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleCouponStatus(coupon)}
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                                  coupon.isActive
                                    ? 'bg-[#EAF3E7] text-[#2D5A27] border border-[#2D5A27]/20'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}
                              >
                                {coupon.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditCoupon(coupon)}
                                  className="p-2 rounded-lg bg-[#FAF6F0] hover:bg-[#F3EAD8] text-[#4A2E1B] border border-[#E8DEC9] cursor-pointer"
                                  title="Edit coupon"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                                  className="p-2 text-red-600 border border-red-200 rounded-lg cursor-pointer bg-red-50 hover:bg-red-100"
                                  title="Delete coupon"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#E8DEC9] text-xs text-[#6D4A32]">
                <p className="font-bold text-[#4A2E1B] mb-1">How it works</p>
                <p>Customers enter these codes on the Cart page. Active coupons are validated live against order subtotal before checkout.</p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* =========================================================================
          GLOBAL MODALS
          ========================================================================= */}

      {/* 1. Single-Page A4 Tax Invoice Modal */}
      {viewingInvoiceOrder && (
        <InvoiceView
          order={viewingInvoiceOrder}
          onClose={() => setViewingInvoiceOrder(null)}
        />
      )}

      {/* 2. Order Detail View Modal */}
      {viewingOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-[#E8DEC9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">
                  Order #{viewingOrderDetail.orderId}
                </h3>
                <span className="text-xs text-[#8A6D56]">Placed on {new Date(viewingOrderDetail.createdAt).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setViewingOrderDetail(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#4A2E1B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8DEC9] text-xs text-[#4A2E1B]">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8A6D56]">Delivery Address</span>
                <p className="font-bold">{viewingOrderDetail.shippingAddress?.fullName}</p>
                <p className="text-[#6D4A32]">{viewingOrderDetail.shippingAddress?.address}</p>
                <p className="text-[#6D4A32]">{viewingOrderDetail.shippingAddress?.city}, {viewingOrderDetail.shippingAddress?.state} - {viewingOrderDetail.shippingAddress?.pincode}</p>
                <p className="text-[#6D4A32]">Phone: <strong>{viewingOrderDetail.shippingAddress?.mobile}</strong></p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-[#E8DEC9] sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-[#8A6D56]">Payment Info</span>
                <p>Method: <strong className="uppercase">{viewingOrderDetail.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Razorpay Online'}</strong></p>
                {viewingOrderDetail.paymentMethod === 'cod' ? (
                  <div className="pt-1">
                    <label className="text-[10px] font-bold text-[#8A6D56] block mb-1">
                      COD Collection Status:
                    </label>
                    <select
                      value={viewingOrderDetail.paymentStatus === 'completed' ? 'completed' : 'pending'}
                      onChange={(e) => handleUpdatePaymentStatus(viewingOrderDetail.orderId || viewingOrderDetail._id, e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                        viewingOrderDetail.paymentStatus === 'completed'
                          ? 'bg-[#EAF3E7] text-[#2D5A27] border-[#2D5A27]/30'
                          : 'bg-[#FEF8EA] text-[#B07812] border-[#D99B26]/40'
                      }`}
                    >
                      <option value="pending">⏳ Due on Delivery (Not Received)</option>
                      <option value="completed">✓ Payment Received (Paid)</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <p>Status: <strong className="text-[#2D5A27]">Completed (Paid Online)</strong></p>
                    {viewingOrderDetail.razorpayPaymentId && (
                      <p className="font-mono text-[11px]">Txn ID: {viewingOrderDetail.razorpayPaymentId}</p>
                    )}
                  </>
                )}
                <p className="pt-1.5 text-sm font-bold text-[#4A2E1B]">Total: ₹{viewingOrderDetail.total}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#8A6D56] uppercase">Purchased Items</span>
              <div className="divide-y divide-gray-100 border border-[#E8DEC9] rounded-2xl overflow-hidden bg-white">
                {viewingOrderDetail.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 text-xs">
                    <div className="flex items-center space-x-3">
                      <img src={it.image} alt={it.name} className="w-10 h-10 rounded-xl object-cover border border-[#E8DEC9]" />
                      <div>
                        <p className="font-bold text-[#4A2E1B]">{it.name}</p>
                        <p className="text-[10px] text-[#8A6D56]">Pack: {it.weight} • Qty: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#4A2E1B]">₹{it.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end pt-2 space-x-2">
              <button
                onClick={() => {
                  setViewingInvoiceOrder(viewingOrderDetail);
                  setViewingOrderDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#F3BF58]" />
                <span>Open Tax Invoice</span>
              </button>
              <button
                onClick={() => setViewingOrderDetail(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Product Add/Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-[#E8DEC9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">
                {editingProduct ? 'Edit Makhana Product' : 'Add New Makhana Product'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#4A2E1B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Product Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Mithila Masala Makhana"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                  >
                    <option value="plain">Plain & Natural</option>
                    <option value="roasted">Ghee Roasted</option>
                    <option value="masala">Mithila Masala</option>
                    <option value="flavoured">Flavoured</option>
                    <option value="sweet">Sweet & Caramel</option>
                    <option value="raw">Raw Harvest Seeds</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Compare Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.compareAtPrice}
                    onChange={(e) => setProductForm({ ...productForm, compareAtPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Pack Size</label>
                  <input
                    type="text"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    placeholder="250g"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Live Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                    required
                  />
                </div>
              </div>

              {/* Product Image Asset Selector */}
              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1.5">
                  Select Product Photography Asset
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {AVAILABLE_IMAGES.map((imgOpt) => {
                    const isSelected = productForm.images[0] === imgOpt.url;
                    return (
                      <div
                        key={imgOpt.url}
                        onClick={() => setProductForm({ ...productForm, images: [imgOpt.url] })}
                        className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FEF8EA] border-[#D99B26] ring-2 ring-[#D99B26]/30'
                            : 'bg-[#FAF6F0] border-[#E8DEC9] hover:bg-white'
                        }`}
                      >
                        <img src={imgOpt.url} alt={imgOpt.label} className="object-cover w-full h-16 mb-1 rounded-lg" />
                        <span className="text-[9px] font-semibold text-[#6D4A32] line-clamp-1">{imgOpt.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Short Description</label>
                <input
                  type="text"
                  value={productForm.shortDescription}
                  onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                  placeholder="e.g. Crisp, naturally puffed fox nuts roasted with authentic Bihar spices."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed product story, farm sourcing, roasting technique, and health benefits..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  className="rounded text-[#D99B26] focus:ring-[#D99B26]"
                />
                <label htmlFor="featured-check" className="text-xs font-semibold text-[#4A2E1B] cursor-pointer">
                  Feature this product prominently on store home page
                </label>
              </div>

              <div className="pt-3 border-t border-[#E8DEC9] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] text-xs font-bold"
                >
                  {editingProduct ? 'Save Changes' : 'Create Makhana'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Recipe Add/Edit Modal */}
      {recipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-[#E8DEC9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">
                {editingRecipe ? 'Edit Recipe' : 'Add New Makhana Recipe'}
              </h3>
              <button
                onClick={() => setRecipeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#4A2E1B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Recipe Title</label>
                <input
                  type="text"
                  value={recipeForm.title}
                  onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })}
                  placeholder="e.g. Traditional Mithila Makhana Kheer"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={recipeForm.description}
                  onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={recipeForm.prepTime}
                    onChange={(e) => setRecipeForm({ ...recipeForm, prepTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Cook Time</label>
                  <input
                    type="text"
                    value={recipeForm.cookTime}
                    onChange={(e) => setRecipeForm({ ...recipeForm, cookTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Servings</label>
                  <input
                    type="text"
                    value={recipeForm.servings}
                    onChange={(e) => setRecipeForm({ ...recipeForm, servings: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Ingredients (one per line)</label>
                <textarea
                  rows={3}
                  value={recipeForm.ingredients}
                  onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value })}
                  placeholder="2 cups Mithila Makhana&#10;1 litre Full Cream Milk&#10;1/2 cup Jaggery or Sugar"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                />
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Instructions (one per line)</label>
                <textarea
                  rows={3}
                  value={recipeForm.instructions}
                  onChange={(e) => setRecipeForm({ ...recipeForm, instructions: e.target.value })}
                  placeholder="1. Roast makhana in ghee until crisp.&#10;2. Boil milk and add roasted lotus seeds."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DEC9] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRecipeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-[#4A2E1B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-white font-bold"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Coupon Create/Edit Modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-[#E8DEC9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF8EA] border border-[#D99B26]/30 flex items-center justify-center text-[#D99B26]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">
                    {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                  </h3>
                  <p className="text-[10px] text-[#8A6D56]">Discount codes customers apply on the Cart page</p>
                </div>
              </div>
              <button
                onClick={() => setCouponModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#4A2E1B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. MITHILA10"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] font-mono uppercase text-[#4A2E1B]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Display Title *</label>
                  <input
                    type="text"
                    value={couponForm.title}
                    onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                    placeholder="e.g. 10% Family Discount"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="Optional short description shown in admin and checkout"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Discount Type *</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Expires On</label>
                <input
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="coupon-active-check"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                  className="rounded text-[#D99B26] focus:ring-[#D99B26]"
                />
                <label htmlFor="coupon-active-check" className="text-xs font-semibold text-[#4A2E1B] cursor-pointer">
                  Active — customers can use this coupon at checkout
                </label>
              </div>

              <div className="pt-3 border-t border-[#E8DEC9] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Administrator Modal */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E8DEC9] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF8EA] border border-[#D99B26]/30 flex items-center justify-center text-[#D99B26]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">
                    Add New Administrator
                  </h3>
                  <p className="text-[10px] text-[#8A6D56]">Authorize backend staff with administrative privileges</p>
                </div>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#4A2E1B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="e.g. Ritesh Mishra"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Email Address (Login Username) *</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    const matched = customerUsers.find(u => u.email?.toLowerCase() === newEmail.trim().toLowerCase());
                    if (matched) {
                      setAdminForm(prev => ({
                        ...prev,
                        email: newEmail,
                        name: prev.name || matched.name,
                        phone: prev.phone || matched.phone || ''
                      }));
                    } else {
                      setAdminForm(prev => ({ ...prev, email: newEmail }));
                    }
                  }}
                  placeholder="e.g. ritesh@mithilamakhana.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
                {matchedExistingCustomer && (
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 flex items-start space-x-2 mt-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Existing Customer Account Found: {matchedExistingCustomer.name}</span>
                      <p className="text-[10px] text-purple-700 mt-0.5">
                        This email is already registered. Submitting this form will automatically upgrade their account to an Administrator and assign this initial password.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Assigned Role Designation</label>
                <select
                  value={adminForm.adminRoleTitle}
                  onChange={(e) => setAdminForm({ ...adminForm, adminRoleTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B] font-medium"
                >
                  <option value="Store Administrator">Store Administrator</option>
                  <option value="Super Administrator">Super Administrator</option>
                  <option value="Inventory & Warehouse Lead">Inventory & Warehouse Lead</option>
                  <option value="Order Fulfillment Manager">Order Fulfillment Manager</option>
                  <option value="Customer Relations Lead">Customer Relations Lead</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Initial Password *</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                  minLength={6}
                />
                <div className="p-2.5 rounded-xl bg-[#FEF8EA] border border-[#D99B26]/30 text-[11px] text-[#B07812] flex items-start space-x-2 mt-2">
                  <Key className="w-3.5 h-3.5 text-[#D99B26] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>First-Time Login Security:</strong> The new administrator will be automatically redirected to change this initial password upon their first sign-in.
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DEC9] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D99B26]" />
                  <span>Create Admin Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Shipment Tracking Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#E8DEC9] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2D5A27]/10 border border-[#2D5A27]/20 flex items-center justify-center text-[#2D5A27]">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">
                    Update Shipment Tracking
                  </h3>
                  <p className="text-[10px] text-[#8A6D56]">
                    Order #{trackingModalOrder.orderId || trackingModalOrder._id} • {trackingModalOrder.shippingAddress?.fullName || trackingModalOrder.user?.name || 'Customer'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#4A2E1B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Shipment Stage *</label>
                  <select
                    value={trackingForm.status}
                    onChange={(e) => setTrackingForm({ ...trackingForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-medium"
                    required
                  >
                    {ORDER_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">Courier Partner *</label>
                  <select
                    value={trackingForm.courier}
                    onChange={(e) => setTrackingForm({ ...trackingForm, courier: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-medium"
                    required
                  >
                    <option value="Delhivery Express">Delhivery Express</option>
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="DTDC Courier">DTDC Courier</option>
                    <option value="India Post (Speed Post)">India Post (Speed Post)</option>
                    <option value="Shadowfax Logistics">Shadowfax Logistics</option>
                    <option value="Ecom Express">Ecom Express</option>
                    <option value="Ekart Logistics">Ekart Logistics</option>
                    <option value="Mithila Farm Direct Transport">Mithila Farm Direct Transport</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">AWB / Consignment Tracking Number *</label>
                <input
                  type="text"
                  value={trackingForm.trackingNumber}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                  placeholder="e.g. MMTRK987654IN"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] font-mono text-[#4A2E1B]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={trackingForm.estimatedDelivery}
                  onChange={(e) => setTrackingForm({ ...trackingForm, estimatedDelivery: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                />
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Tracking Milestone Update Note (Optional)</label>
                <input
                  type="text"
                  value={trackingForm.notes}
                  onChange={(e) => setTrackingForm({ ...trackingForm, notes: e.target.value })}
                  placeholder="e.g. Dispatched from Darbhanga Hub, handed to Delhivery"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1 text-[11px] text-[#6D4A32]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A2E1B]">Customer Destination:</span>
                  <span>{trackingModalOrder.shippingAddress?.city || 'Darbhanga'}, {trackingModalOrder.shippingAddress?.state || 'Bihar'} - {trackingModalOrder.shippingAddress?.postalCode || '846004'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4A2E1B]">Customer Phone:</span>
                  <span>{trackingModalOrder.shippingAddress?.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DEC9] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#1E3E1A] text-white font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Truck className="w-4 h-4 text-[#F3BF58]" />
                  <span>Update & Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Promote Customer to Administrator Modal */}
      {promoteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E8DEC9] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center justify-center text-purple-600 border border-purple-200 w-9 h-9 rounded-xl bg-purple-50">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">
                    Promote to Administrator
                  </h3>
                  <p className="text-[10px] text-[#8A6D56]">Grant backend staff privileges to an existing customer</p>
                </div>
              </div>
              <button
                onClick={() => setPromoteModalUser(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#4A2E1B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPromote} className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-[#4A2E1B]">Customer Name:</span>
                  <span className="font-semibold text-[#6D4A32]">{promoteModalUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#4A2E1B]">Email Address:</span>
                  <span className="font-mono text-[#6D4A32]">{promoteModalUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#4A2E1B]">Current Role:</span>
                  <span className="capitalize text-[#2D5A27] font-bold">Standard Customer</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Select Administrator Role Designation *</label>
                <select
                  value={promoteForm.adminRoleTitle}
                  onChange={(e) => setPromoteForm({ ...promoteForm, adminRoleTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B] font-medium"
                >
                  <option value="Store Administrator">Store Administrator</option>
                  <option value="Super Administrator">Super Administrator</option>
                  <option value="Inventory & Warehouse Lead">Inventory & Warehouse Lead</option>
                  <option value="Order Fulfillment Manager">Order Fulfillment Manager</option>
                  <option value="Customer Relations Lead">Customer Relations Lead</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="set-initial-pass"
                    checked={promoteForm.setInitialPassword}
                    onChange={(e) => setPromoteForm({ ...promoteForm, setInitialPassword: e.target.checked })}
                    className="text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="set-initial-pass" className="text-xs font-semibold text-[#4A2E1B] cursor-pointer">
                    Assign initial password (forces password change on login)
                  </label>
                </div>

                {promoteForm.setInitialPassword ? (
                  <div>
                    <input
                      type="text"
                      value={promoteForm.initialPassword}
                      onChange={(e) => setPromoteForm({ ...promoteForm, initialPassword: e.target.value })}
                      placeholder="Temporary password (min 6 chars)"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-mono text-xs"
                      required={promoteForm.setInitialPassword}
                      minLength={6}
                    />
                    <p className="text-[10px] text-[#8A6D56] mt-1">
                      Give this temporary password to the user. On their next sign-in, they will immediately be asked to set their permanent password.
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-[#8A6D56]">
                    The user will keep their current customer account password to log in as an administrator.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#E8DEC9] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPromoteModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-200" />
                  <span>Grant Admin Privileges</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Super Administrator - Update Admin Role & Designation Modal */}
      {editRoleAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E8DEC9] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF8EA] border border-[#D99B26]/30 flex items-center justify-center text-[#D99B26]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#4A2E1B]">
                    Update Administrator Role
                  </h3>
                  <p className="text-[10px] text-[#8A6D56]">Super Administrator Privilege: Modify staff authority & designation</p>
                </div>
              </div>
              <button
                onClick={() => setEditRoleAdminModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#4A2E1B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRole} className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-[#4A2E1B]">Administrator:</span>
                  <span className="font-semibold text-[#6D4A32]">{editRoleAdminModal.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#4A2E1B]">Email Address:</span>
                  <span className="font-mono text-[#6D4A32]">{editRoleAdminModal.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#4A2E1B]">Current Designation:</span>
                  <span className="text-[#D99B26] font-bold">{editRoleAdminModal.adminRoleTitle || 'Store Administrator'}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4A2E1B] block mb-1">Account Role Type *</label>
                <select
                  value={editRoleForm.role}
                  onChange={(e) => setEditRoleForm({ ...editRoleForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B] font-medium"
                >
                  <option value="admin">Administrator (Backend Privileges)</option>
                  <option value="customer">Demote to Standard Customer (Revoke Admin)</option>
                </select>
              </div>

              {editRoleForm.role === 'admin' && (
                <div>
                  <label className="font-bold text-[#4A2E1B] block mb-1">New Role Designation *</label>
                  <select
                    value={editRoleForm.adminRoleTitle}
                    onChange={(e) => setEditRoleForm({ ...editRoleForm, adminRoleTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B] font-medium"
                  >
                    <option value="Store Administrator">Store Administrator</option>
                    <option value="Super Administrator">Super Administrator (Root Privileges)</option>
                    <option value="Inventory & Warehouse Lead">Inventory & Warehouse Lead</option>
                    <option value="Order Fulfillment Manager">Order Fulfillment Manager</option>
                    <option value="Customer Relations Lead">Customer Relations Lead</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-reset-pass"
                    checked={editRoleForm.resetPassword}
                    onChange={(e) => setEditRoleForm({ ...editRoleForm, resetPassword: e.target.checked })}
                    className="rounded text-[#D99B26] focus:ring-[#D99B26]"
                  />
                  <label htmlFor="edit-reset-pass" className="text-xs font-semibold text-[#4A2E1B] cursor-pointer">
                    Reset password (forces password change on next login)
                  </label>
                </div>

                {editRoleForm.resetPassword && (
                  <div>
                    <input
                      type="text"
                      value={editRoleForm.newPassword}
                      onChange={(e) => setEditRoleForm({ ...editRoleForm, newPassword: e.target.value })}
                      placeholder="Temporary password (min 6 chars)"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] text-[#4A2E1B] font-mono text-xs"
                      required={editRoleForm.resetPassword}
                      minLength={6}
                    />
                    <p className="text-[10px] text-[#8A6D56] mt-1">
                      Give this temporary password to the administrator. They will be forced to set their permanent password upon next login.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E8DEC9] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditRoleAdminModal(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4A2E1B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4 text-[#D99B26]" />
                  <span>Save Role Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
