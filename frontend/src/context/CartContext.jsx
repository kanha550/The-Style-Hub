import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  // Load cart
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/cart/${user.email}`);
          if (res.ok) {
            const data = await res.json();
            // Data from DB includes product details joined
            // Format to match frontend state
            const formattedCart = data.map(item => ({
              ...item,
              id: item.id, // This is product_id due to join, wait, SELECT p.* overrides. So p.id is product.id.
              cartItemId: item.cartItemId,
              size: item.size,
              quantity: item.quantity
            }));
            setCartItems(formattedCart);
          }
        } catch (error) {
          console.error("Failed to load cart from server", error);
        }
      } else {
        const storedCart = localStorage.getItem('aura_cart_guest');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        } else {
          setCartItems([]);
        }
      }
    };
    loadCart();
  }, [user]);

  // Save cart
  useEffect(() => {
    if (!user) {
      if (cartItems.length > 0 || localStorage.getItem('aura_cart_guest')) {
        localStorage.setItem('aura_cart_guest', JSON.stringify(cartItems));
      }
    } else {
      // Sync to backend
      const syncCart = async () => {
        try {
          await fetch(`/api/cart/${user.email}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cartItems })
          });
        } catch (error) {
          console.error("Failed to sync cart to server", error);
        }
      };
      // Simple debounce or just sync immediately for now
      syncCart();
    }
  }, [cartItems, user]);

  const addToCart = (product, size) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id && item.size === size 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, size, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.size === size)));
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId && item.size === size 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (!user) {
      localStorage.removeItem('aura_cart_guest');
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
