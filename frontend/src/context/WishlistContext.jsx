import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { authAPI } from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('mithila_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const { success, info } = useToast();
  const { isAuthenticated } = useAuth();
  const prevAuthRef = useRef(isAuthenticated);

  // Auto-clear wishlist whenever user logs out
  useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      setWishlist([]);
      try {
        localStorage.removeItem('mithila_wishlist');
      } catch (e) {}
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Listen for explicit auth:logout event as extra resilience
  useEffect(() => {
    const handleLogout = () => {
      setWishlist([]);
      try {
        localStorage.removeItem('mithila_wishlist');
      } catch (e) {}
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mithila_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const toggleWishlist = async (product) => {
    const exists = wishlist.some((item) => item._id === product._id);

    if (exists) {
      setWishlist((prev) => prev.filter((item) => item._id !== product._id));
      info(`Removed ${product.name} from wishlist.`);
    } else {
      setWishlist((prev) => [...prev, product]);
      success(`Saved ${product.name} to wishlist!`);
    }

    if (isAuthenticated) {
      try {
        await authAPI.toggleWishlist(product._id);
      } catch (err) {
        // Silent fail; local state already updated
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
