import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Attach JWT Token if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mithila_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and has expired token, clean up
      if (localStorage.getItem('mithila_token')) {
        localStorage.removeItem('mithila_token');
        localStorage.removeItem('mithila_user');
      }
    }
    return Promise.reject(error);
  }
);

// Product API
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getBySlugOrId: (idOrSlug) => api.get(`/products/${idOrSlug}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  getCategories: () => api.get('/products/categories/all')
};

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  sendRegisterOtp: (data) => api.post('/auth/send-register-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  validateResetOtp: (data) => api.post('/auth/validate-reset-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  toggleWishlist: (productId) => api.post('/auth/wishlist/toggle', { productId }),
  getWishlist: () => api.get('/auth/wishlist')
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  getAllOrders: (params) => api.get('/orders', { params }),
  updateStatus: (orderId, status, notes, trackingData = {}) => api.put(`/orders/${orderId}/status`, { status, notes, ...trackingData }),
  updatePaymentStatus: (orderId, paymentStatus, notes) => api.put(`/orders/${orderId}/payment-status`, { paymentStatus, notes })
};

// Payment API
export const paymentAPI = {
  getConfig: () => api.get('/payments/config'),
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data)
};

// Recipe API
export const recipeAPI = {
  getAll: () => api.get('/recipes'),
  getBySlug: (slug) => api.get(`/recipes/${slug}`),
  create: (data) => api.post('/recipes', data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`)
};

// Contact API
export const contactAPI = {
  sendMessage: (data) => api.post('/contact', data),
  getAllMessages: () => api.get('/contact'),
  updateStatus: (id, status) => api.put(`/contact/${id}`, { status })
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  toggleBlock: (userId, isBlocked, target = 'customer') => api.put(`/admin/users/${userId}/block`, { isBlocked, target }),
  updateRole: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
  createAdmin: (data) => api.post('/admin/admins', data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`)
};

// Coupon API (customer cart)
export const couponAPI = {
  getAvailable: () => api.get('/coupons'),
  validate: (data) => api.post('/coupons/validate', data)
};

// Public store settings (delivery rules for cart/checkout)
export const settingsAPI = {
  get: () => api.get('/settings')
};

export default api;
