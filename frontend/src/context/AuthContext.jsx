import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    // Check saved credentials
    const savedToken = localStorage.getItem('mithila_token');
    const savedUser = localStorage.getItem('mithila_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('mithila_token');
        localStorage.removeItem('mithila_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, portal = 'customer') => {
    try {
      const res = await authAPI.login({ email, password, portal });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('mithila_token', token);
        localStorage.setItem('mithila_user', JSON.stringify(user));
        success(`Welcome back, ${user.name}!`);
        return { success: true, user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async ({ name, email, password, phone, otp }) => {
    try {
      const res = await authAPI.register({ name, email, password, phone, otp });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('mithila_token', token);
        localStorage.setItem('mithila_user', JSON.stringify(user));
        success('Account verified and created successfully! Welcome to Mithila Makhana.');
        return { success: true, user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mithila_token');
    localStorage.removeItem('mithila_user');
    localStorage.removeItem('mithila_cart');
    localStorage.removeItem('mithila_wishlist');
    window.dispatchEvent(new Event('auth:logout'));
    success('Logged out successfully. See you soon!');
  };

  const updateProfile = async (data) => {
    try {
      const res = await authAPI.updateProfile(data);
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('mithila_user', JSON.stringify(res.data.user));
        success('Profile updated successfully.');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      error(msg);
      return { success: false, message: msg };
    }
  };

  const changePassword = async ({ currentPassword, newPassword, portal }) => {
    try {
      const res = await authAPI.changePassword({ currentPassword, newPassword, portal });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('mithila_user', JSON.stringify(res.data.user));
        success(res.data.message || 'Password changed successfully!');
        return { success: true, user: res.data.user, message: res.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      error(msg);
      return { success: false, message: msg };
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        sendRegisterOtp: authAPI.sendRegisterOtp,
        verifyOtp: authAPI.verifyOtp,
        forgotPassword: authAPI.forgotPassword,
        validateResetOtp: authAPI.validateResetOtp,
        resetPassword: authAPI.resetPassword,
        changePassword,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
