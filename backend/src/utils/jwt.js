import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mithila_makhana_jwt_secret_key_2026_authentic_bihar';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

const generateToken = (userId, role = 'customer') => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export {
  generateToken,
  verifyToken
};
