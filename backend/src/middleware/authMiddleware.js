import { verifyToken } from '../utils/jwt.js';
import Store from '../services/store.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to continue.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }

  const user = Store.getUserById(decoded.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User account not found.'
    });
  }

  const { password, adminPassword, ...safeUser } = user;
  req.user = safeUser;
  next();
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Restricted area. Administrator privileges required.'
    });
  }
};

const optionalAuth = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      const user = Store.getUserById(decoded.id);
      if (user) {
        const { password, adminPassword, ...safeUser } = user;
        req.user = safeUser;
      }
    }
  }
  next();
};

const isSuperAdminUser = (user) => {
  if (!user || user.role !== 'admin') return false;
  const title = (user.adminRoleTitle || '').toLowerCase();
  return title.includes('super') || user.email?.toLowerCase() === 'admin@mithilamakhana.com';
};

const superAdmin = (req, res, next) => {
  if (req.user && isSuperAdminUser(req.user)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Only Super Administrators have authority to perform this action.'
    });
  }
};

export {
  protect,
  admin,
  superAdmin,
  isSuperAdminUser,
  optionalAuth
};
