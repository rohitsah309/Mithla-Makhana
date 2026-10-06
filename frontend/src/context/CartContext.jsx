import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { settingsAPI } from '../services/api';

const CartContext = createContext(null);

const DEFAULT_FREE_SHIPPING_THRESHOLD = 499;
const DEFAULT_STANDARD_SHIPPING_FEE = 50;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('mithila_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULT_FREE_SHIPPING_THRESHOLD);
  const [standardShippingFee, setStandardShippingFee] = useState(DEFAULT_STANDARD_SHIPPING_FEE);

  const { success, info } = useToast();
  const { isAuthenticated } = useAuth();
  const prevAuthRef = useRef(isAuthenticated);

  // Load live delivery rules from store settings
  useEffect(() => {
    let cancelled = false;
    const loadShippingRules = async () => {
      try {
        const res = await settingsAPI.get();
        if (!cancelled && res.data?.success && res.data.settings) {
          const threshold = Number(res.data.settings.freeShippingThreshold);
          const fee = Number(res.data.settings.standardShippingFee);
          if (!Number.isNaN(threshold) && threshold >= 0) setFreeShippingThreshold(threshold);
          if (!Number.isNaN(fee) && fee >= 0) setStandardShippingFee(fee);
        }
      } catch (err) {
        // Keep defaults if settings endpoint is unavailable
      }
    };
    loadShippingRules();

    const handleSettingsUpdated = () => loadShippingRules();
    window.addEventListener('mithila:settings-updated', handleSettingsUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener('mithila:settings-updated', handleSettingsUpdated);
    };
  }, []);

  // Auto-clear cart whenever user logs out
  useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      setCartItems([]);
      try {
        localStorage.removeItem('mithila_cart');
      } catch (e) {}
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Listen for explicit auth:logout event as extra resilience
  useEffect(() => {
    const handleLogout = () => {
      setCartItems([]);
      try {
        localStorage.removeItem('mithila_cart');
      } catch (e) {}
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mithila_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedWeight = null) => {
    const weight = selectedWeight || product.weight || '250g';
    
    // Find price matching weight if weight option chosen
    let price = product.price;
    if (product.availableWeights && product.availableWeights.length > 0) {
      const match = product.availableWeights.find((w) => w.weight === weight);
      if (match) {
        price = match.price;
      }
    }

    setCartItems((prevItems) => {
      const itemKey = `${product._id}_${weight}`;
      const existingIndex = prevItems.findIndex((item) => `${item.id}_${item.weight}` === itemKey);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].price;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: product._id,
            slug: product.slug,
            name: product.name,
            image: product.images?.[0] || product.image || '/images/plain-makhana-bowl.png',
            price: Number(price),
            weight: weight,
            quantity: quantity,
            subtotal: Number(price) * quantity
          }
        ];
      }
    });

    success(`Added ${product.name} (${weight}) to your cart!`);
  };

  const removeFromCart = (id, weight) => {
    setCartItems((prev) => prev.filter((item) => !(item.id === id && item.weight === weight)));
    info('Item removed from cart.');
  };

  const updateQuantity = (id, weight, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id, weight);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.weight === weight) {
          return {
            ...item,
            quantity: newQty,
            subtotal: item.price * newQty
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('mithila_cart');
  };

  // Calculations using live delivery rules
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const shippingFee = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const total = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        shippingFee,
        freeShippingThreshold,
        amountToFreeShipping,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
