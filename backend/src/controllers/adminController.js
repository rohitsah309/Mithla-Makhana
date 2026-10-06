import Store from '../services/store.js';
import bcrypt from 'bcryptjs';

// @desc    Get Admin Dashboard metrics and stats
// @route   GET /api/admin/stats
const getDashboardStats = (req, res, next) => {
  try {
    const orders = Store.getOrders();
    const products = Store.getProducts();
    const users = Store.getAllUsers();
    const messages = Store.getContactMessages();

    // Total revenue from non-cancelled orders
    const revenue = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    const recentOrders = orders.slice(0, 5);

    // Status breakdown
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
      return acc;
    }, {});

    // Low stock products (< 20 units)
    const lowStockProducts = products.filter((p) => (p.stock || 0) < 20);

    // Month-wise and Year-wise aggregations
    const yearStatsMap = {};
    const monthStatsMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    orders.forEach((order) => {
      if (order.orderStatus === 'Cancelled') return;
      const date = new Date(order.createdAt || Date.now());
      const year = date.getFullYear().toString();
      const monthIndex = date.getMonth();
      const monthNum = String(monthIndex + 1).padStart(2, '0');
      const monthKey = `${year}-${monthNum}`;
      const total = Number(order.total || 0);
      const isOnline = order.paymentMethod === 'razorpay';
      const isCod = order.paymentMethod === 'cod';
      const isCodReceived = isCod && order.paymentStatus === 'completed';
      const isCodPending = isCod && order.paymentStatus !== 'completed';
      const itemCount = (order.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
      const isDelivered = order.orderStatus === 'Delivered';

      // Year-wise rollup
      if (!yearStatsMap[year]) {
        yearStatsMap[year] = {
          year,
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
      yearStatsMap[year].ordersCount += 1;
      yearStatsMap[year].revenue += total;
      if (isOnline) yearStatsMap[year].onlineRevenue += total;
      if (isCod) {
        yearStatsMap[year].codRevenue += total;
        if (isCodReceived) yearStatsMap[year].codReceived += total;
        if (isCodPending) yearStatsMap[year].codPending += total;
      }
      if (isDelivered) yearStatsMap[year].deliveredCount += 1;
      yearStatsMap[year].itemsSold += itemCount;

      // Month-wise rollup
      if (!monthStatsMap[monthKey]) {
        monthStatsMap[monthKey] = {
          key: monthKey,
          year,
          monthIndex,
          monthName: monthNames[monthIndex],
          label: `${monthNames[monthIndex]} ${year}`,
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
      monthStatsMap[monthKey].ordersCount += 1;
      monthStatsMap[monthKey].revenue += total;
      if (isOnline) monthStatsMap[monthKey].onlineRevenue += total;
      if (isCod) {
        monthStatsMap[monthKey].codRevenue += total;
        if (isCodReceived) monthStatsMap[monthKey].codReceived += total;
        if (isCodPending) monthStatsMap[monthKey].codPending += total;
      }
      if (isDelivered) monthStatsMap[monthKey].deliveredCount += 1;
      monthStatsMap[monthKey].itemsSold += itemCount;
    });

    const yearlyData = Object.values(yearStatsMap).sort((a, b) => Number(b.year) - Number(a.year));
    const monthlyData = Object.values(monthStatsMap).sort((a, b) => a.key.localeCompare(b.key));

    res.json({
      success: true,
      stats: {
        totalRevenue: revenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
        totalInquiries: messages.length,
        statusCounts,
        recentOrders,
        lowStockProducts,
        yearlyData,
        monthlyData
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all registered users (Admin)
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await Store.getAllUsers();
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle block/unblock status for a customer or administrator independently
// @route   PUT /api/admin/users/:userId/block
const toggleUserBlock = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isBlocked, target = 'customer' } = req.body;
    const targetUser = Store.getUserById(userId);

    if (req.user?._id === userId && (target === 'admin' || target === 'all')) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot suspend their own admin account.'
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    if (
      (target === 'admin' || target === 'all') &&
      isSuperAdminUser(req.user) &&
      isSuperAdminUser(targetUser) &&
      String(req.user?._id) !== String(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Super Administrators cannot suspend or block each other.'
      });
    }

    const updated = await Store.toggleUserBlock(userId, isBlocked, target);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    let message;
    if (target === 'admin') {
      message = `Administrator access for "${updated.name}" has been ${updated.isAdminBlocked ? 'suspended' : 'restored'} successfully. (Customer shopping account remains unaffected)`;
    } else {
      message = `Customer account for "${updated.name}" has been ${updated.isCustomerBlocked ? 'blocked' : 'unblocked'} successfully. (Administrator privileges remain unaffected)`;
    }

    res.json({
      success: true,
      message,
      user: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new administrator account
// @route   POST /api/admin/admins
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone, adminRoleTitle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide administrator name, email, and password.'
      });
    }

    const existing = Store.getUserByEmail(email);
    if (existing) {
      if (existing.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'An administrator account with this email address already exists.'
        });
      }

      // Existing customer account found: Promote to Administrator!
      // Sets dedicated adminPassword without overwriting their existing customer password!
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const updated = Store.updateUser(existing._id, {
        role: 'admin',
        name: name || existing.name,
        phone: phone || existing.phone,
        adminRoleTitle: adminRoleTitle || 'Store Administrator',
        adminPassword: hashedPassword,
        mustChangePassword: true,
        isInitialPassword: true
      });

      const { password: _, adminPassword: __, ...safeAdmin } = updated;

      return res.status(200).json({
        success: true,
        message: `Existing customer "${updated.name}" has been promoted to Administrator! (Customer password preserved independently)`,
        admin: safeAdmin,
        isPromoted: true
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = Store.createUser({
      name,
      email: email.toLowerCase(),
      adminPassword: hashedPassword,
      password: hashedPassword, // Initial fallback customer password
      phone: phone || '',
      role: 'admin',
      adminRoleTitle: adminRoleTitle || 'Store Administrator',
      mustChangePassword: true,
      isInitialPassword: true,
      createdAt: new Date().toISOString()
    });

    const { password: _, adminPassword: __, ...safeAdmin } = newAdmin;

    res.status(201).json({
      success: true,
      message: `New administrator "${name}" created successfully!`,
      admin: safeAdmin
    });
  } catch (err) {
    next(err);
  }
};

const isSuperAdminUser = (user) => {
  if (!user || user.role !== 'admin') return false;
  const title = (user.adminRoleTitle || '').toLowerCase();
  return title.includes('super') || user.email?.toLowerCase() === 'admin@mithilamakhana.com';
};

// @desc    Change user role (e.g. Promote Customer to Admin, Demote Admin, or Update Admin Role Title)
// @route   PUT /api/admin/users/:userId/role
const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role, adminRoleTitle, password, resetPasswordToInitial } = req.body;

    if (!isSuperAdminUser(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only Super Administrators can update administrator roles.'
      });
    }

    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "admin" or "customer".'
      });
    }

    if (req.user?._id === userId && role === 'customer') {
      return res.status(400).json({
        success: false,
        message: 'You cannot revoke your own administrator privileges.'
      });
    }

    const targetUser = Store.getUserById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    if (targetUser.email === 'admin@mithilamakhana.com' && role === 'customer') {
      return res.status(400).json({
        success: false,
        message: 'The primary system Super Administrator cannot be converted to a customer.'
      });
    }

    if (
      targetUser.role === 'admin' &&
      isSuperAdminUser(targetUser) &&
      String(req.user?._id) !== String(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Super Administrators cannot change each other roles.'
      });
    }

    const updates = {
      role,
      adminRoleTitle: role === 'admin' ? (adminRoleTitle || targetUser.adminRoleTitle || 'Store Administrator') : undefined
    };

    if (role === 'admin' && resetPasswordToInitial && password) {
      const salt = await bcrypt.genSalt(10);
      updates.adminPassword = await bcrypt.hash(password, salt);
      updates.mustChangePassword = true;
      updates.isInitialPassword = true;
    }

    const updated = Store.updateUser(userId, updates);
    const { password: _, adminPassword: __, ...safeUser } = updated;

    res.json({
      success: true,
      message: role === 'admin'
        ? `Administrator "${updated.name}" updated to "${updates.adminRoleTitle}" successfully!`
        : `Administrator "${updated.name}" has been converted to standard Customer.`,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/Revoke user account (Admin)
// @route   DELETE /api/admin/users/:userId
const deleteUser = (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user?._id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your currently active administrator account.'
      });
    }

    const targetUser = Store.getUserById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    if (targetUser.email === 'admin@mithilamakhana.com') {
      return res.status(400).json({
        success: false,
        message: 'The primary system Super Administrator account cannot be deleted.'
      });
    }

    if (
      targetUser.role === 'admin' &&
      isSuperAdminUser(req.user) &&
      isSuperAdminUser(targetUser) &&
      String(req.user?._id) !== String(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Super Administrators cannot delete each other.'
      });
    }

    if (targetUser.role === 'admin' && !isSuperAdminUser(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only Super Administrators can delete administrator accounts.'
      });
    }

    const removed = Store.deleteUser(userId);
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    res.json({
      success: true,
      message: `Account "${targetUser.name}" (${targetUser.role === 'admin' ? 'Administrator' : 'Customer'}) deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get store settings (business profile + delivery rules)
// @route   GET /api/admin/settings
const getStoreSettings = (req, res, next) => {
  try {
    const settings = Store.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

// @desc    Update store settings
// @route   PUT /api/admin/settings
const updateStoreSettings = (req, res, next) => {
  try {
    const settings = Store.updateSettings(req.body || {});
    res.json({
      success: true,
      message: 'Store settings saved successfully.',
      settings
    });
  } catch (err) {
    next(err);
  }
};

export {
  getDashboardStats,
  getUsers,
  toggleUserBlock,
  createAdmin,
  updateUserRole,
  deleteUser,
  getStoreSettings,
  updateStoreSettings
};
