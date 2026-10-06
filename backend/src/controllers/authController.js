import bcrypt from 'bcryptjs';
import Store from '../services/store.js';
import { generateToken } from '../utils/jwt.js';
import otpService from '../services/otpService.js';
import emailService from '../services/emailService.js';

// @desc    Send OTP to email for customer registration
// @route   POST /api/auth/send-register-otp
const sendRegisterOtp = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = Store.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.'
      });
    }

    // Rate-limiting check
    const canResendCheck = otpService.canResend(cleanEmail);
    if (!canResendCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${canResendCheck.waitSeconds}s before requesting a new code.`
      });
    }

    // Generate 6-digit OTP (valid for 10 minutes)
    const { code, expiresInMinutes } = otpService.generateOtp(cleanEmail, name);

    // Send email via nodemailer / dev fallback
    const emailResult = await emailService.sendRegisterOtpEmail({
      email: cleanEmail,
      name,
      otp: code
    });

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      email: cleanEmail,
      expiresInMinutes,
      devOtp: emailResult.devOtp || undefined
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP code for an email without creating user
// @route   POST /api/auth/verify-otp
const verifyOtpOnly = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and verification code.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const verifyResult = otpService.verifyOtp(cleanEmail, otp);

    if (!verifyResult.valid) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message
      });
    }

    res.json({
      success: true,
      message: 'Email verified successfully!'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register a new customer with verified Email OTP
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Email verification code (OTP) is required. Please verify your email.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = Store.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Verify Email OTP
    const otpCheck = otpService.verifyOtp(cleanEmail, otp);
    if (!otpCheck.valid) {
      return res.status(400).json({
        success: false,
        message: otpCheck.message
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = Store.createUser({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'customer',
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString()
    });

    const token = generateToken(newUser._id, newUser.role);
    const { password: _, adminPassword: __, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Email verified and account created successfully! Welcome to Mithila Makhana.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login customer or admin
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = Store.getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isAdminPortal = portal === 'admin';
    const isCustomerPortal = portal === 'customer';

    if (isAdminPortal) {
      // Check admin blocked/suspended status (independent of customer status)
      const isAdminBlocked = Boolean(user.isAdminBlocked ?? (user.isAdminBlocked === undefined && user.isBlocked));
      if (isAdminBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your administrator account access has been suspended. Please contact the primary administrator.'
        });
      }

      // Admin Login Portal: strictly requires user to have administrator privileges
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: This account does not have administrator privileges. Please sign in via the Customer Login page.'
        });
      }

      // Check admin password (fall back to password if adminPassword not yet initialized)
      const targetHash = user.adminPassword || user.password;
      const isMatch = await bcrypt.compare(password, targetHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or admin password.'
        });
      }

      const token = generateToken(user._id, 'admin');
      const { password: _, adminPassword: __, ...safeUser } = user;

      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: { ...safeUser, role: 'admin' }
      });
    }

    // Customer Login Portal (or general storefront login):
    // Check customer blocked status (independent of admin status)
    const isCustomerBlocked = Boolean(user.isCustomerBlocked ?? (user.isCustomerBlocked === undefined && user.isBlocked));
    if (isCustomerBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your customer account has been deactivated or blocked by the administrator. Please contact support@mithilamakhana.com.'
      });
    }

    // Authenticate strictly with user's customer password
    const targetHash = user.password || user.adminPassword;
    const isMatch = await bcrypt.compare(password, targetHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or customer password.'
      });
    }

    // In customer storefront, even if user is also an admin in DB,
    // logging into the customer portal grants them customer session capabilities
    const effectiveRole = isCustomerPortal ? 'customer' : user.role;
    const token = generateToken(user._id, effectiveRole);
    const { password: _, adminPassword: __, ...safeUser } = user;

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        ...safeUser,
        role: effectiveRole,
        isAlsoAdmin: user.role === 'admin'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  const user = Store.getUserById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const { password: _, adminPassword: __, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
};

// @desc    Update user profile & addresses
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (addresses) updateData.addresses = addresses;

    const updatedUser = Store.updateUser(req.user._id, updateData);
    const { password: _, adminPassword: __, ...safeUser } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/auth/wishlist/toggle
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    const user = Store.getUserById(req.user._id);
    let wishlist = user.wishlist || [];

    const exists = wishlist.includes(productId);
    if (exists) {
      wishlist = wishlist.filter((id) => id !== productId);
    } else {
      wishlist.push(productId);
    }

    Store.updateUser(req.user._id, { wishlist });

    res.json({
      success: true,
      isWishlisted: !exists,
      wishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's wishlist products
// @route   GET /api/auth/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const user = Store.getUserById(req.user._id);
    const wishlistIds = user.wishlist || [];
    const allProducts = Store.getProducts();
    const products = allProducts.filter((p) => wishlistIds.includes(p._id));

    res.json({
      success: true,
      wishlist: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Initiate password reset by sending OTP to user's email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = Store.getUserByEmail(cleanEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address. Please check your email or create a new account.'
      });
    }

    const { portal } = req.body;
    if (portal === 'admin') {
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'This email is not registered as an administrator account.'
        });
      }
      const isAdmBlocked = Boolean(user.isAdminBlocked ?? (user.isAdminBlocked === undefined && user.isBlocked));
      if (isAdmBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your administrator account access has been suspended. Please contact the primary administrator.'
        });
      }
    } else {
      const isCustBlocked = Boolean(user.isCustomerBlocked ?? (user.isCustomerBlocked === undefined && user.isBlocked));
      if (isCustBlocked && (user.role !== 'admin' || portal === 'customer')) {
        return res.status(403).json({
          success: false,
          message: 'This account has been deactivated or blocked by the administrator. Please contact support@mithilamakhana.com.'
        });
      }
    }

    // Rate-limiting check (30s cooldown between requests)
    const canResendCheck = otpService.canResend(cleanEmail);
    if (!canResendCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${canResendCheck.waitSeconds}s before requesting a new reset code.`
      });
    }

    // Generate 6-digit OTP (valid for 10 minutes)
    const { code, expiresInMinutes } = otpService.generateOtp(cleanEmail, user.name);

    // Send email via nodemailer / dev fallback
    const emailResult = await emailService.sendResetPasswordOtpEmail({
      email: cleanEmail,
      name: user.name,
      otp: code
    });

    res.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${cleanEmail}.`,
      email: cleanEmail,
      expiresInMinutes,
      devOtp: emailResult.devOtp || undefined
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Validate OTP for password reset and issue temporary reset token
// @route   POST /api/auth/validate-reset-otp
const validateResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and verification code.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = Store.getUserByEmail(cleanEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    const check = otpService.validateResetOtp(cleanEmail, otp);
    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.message
      });
    }

    res.json({
      success: true,
      message: 'Verification code validated successfully! Please set your new password.',
      resetToken: check.resetToken
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password using verified resetToken or OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, otp, newPassword, portal } = req.body;

    if (!email || (!resetToken && !otp) || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email, verification authorization, and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = Store.getUserByEmail(cleanEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    if (portal === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This email is not registered as an administrator account.'
      });
    }

    // Verify reset authorization and consume it
    const authCheck = otpService.verifyAndConsumeResetAuth(cleanEmail, { resetToken, otp });
    if (!authCheck.valid) {
      return res.status(400).json({
        success: false,
        message: authCheck.message
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (portal === 'admin') {
      // Update ONLY the administrator password. Customer storefront password remains unchanged.
      Store.updateUser(user._id, {
        adminPassword: hashedPassword,
        mustChangePassword: false,
        isInitialPassword: false,
        adminPasswordChangedAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        message: 'Your administrator password has been reset successfully! You can now sign in to the Admin Portal.'
      });
    }

    // Update customer password in database (strictly leaves adminPassword untouched!)
    Store.updateUser(user._id, {
      password: hashedPassword,
      customerPasswordChangedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Your customer account password has been reset successfully! You can now sign in with your new password.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password for authenticated user (Supports independent Admin & Customer passwords)
// @route   PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, portal } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current password and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = Store.getUserById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // Determine whether this request targets the Admin credentials or Customer credentials
    const isAdminChange = portal === 'admin' || (req.user.role === 'admin' && portal !== 'customer');

    if (isAdminChange) {
      // 1. ADMINISTRATOR PASSWORD CHANGE
      const adminTargetHash = user.adminPassword || user.password;
      const isMatch = await bcrypt.compare(currentPassword, adminTargetHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current/initial administrator password does not match.'
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New administrator password cannot be the same as your current password.'
        });
      }

      // Hash new admin password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // IMPORTANT: Update ONLY adminPassword! Customer password (user.password) is NOT TOUCHED!
      const updated = Store.updateUser(user._id, {
        adminPassword: hashedPassword,
        mustChangePassword: false,
        isInitialPassword: false,
        adminPasswordChangedAt: new Date().toISOString()
      });

      const { password: _, adminPassword: __, ...safeUser } = updated;

      return res.json({
        success: true,
        message: 'Administrator password changed successfully! Your customer storefront password remains completely unchanged.',
        user: { ...safeUser, role: 'admin' }
      });
    }

    // 2. CUSTOMER PASSWORD CHANGE
    const customerTargetHash = user.password || user.adminPassword;
    const isMatch = await bcrypt.compare(currentPassword, customerTargetHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current customer password does not match.'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New customer password cannot be the same as your current password.'
      });
    }

    // Hash new customer password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // IMPORTANT: Update ONLY customer password (user.password)! adminPassword is NOT TOUCHED!
    const updated = Store.updateUser(user._id, {
      password: hashedPassword,
      customerPasswordChangedAt: new Date().toISOString()
    });

    const { password: _, adminPassword: __, ...safeUser } = updated;

    return res.json({
      success: true,
      message: 'Customer password changed successfully! Your administrator password remains completely unchanged.',
      user: { ...safeUser, role: req.user.role }
    });
  } catch (err) {
    next(err);
  }
};

export {
  sendRegisterOtp,
  verifyOtpOnly,
  register,
  login,
  forgotPassword,
  validateResetOtp,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  toggleWishlist,
  getWishlist
};
