import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user, getAuthHeader } = useAuth();

  // Load cart whenever the logged-in user changes
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/cart/${user.email}`, {
            headers: { ...getAuthHeader() }
          });
          if (res.ok) {
            const data = await res.json();
            setCartItems(data);
          } else {
            setCartItems([]);
          }
        } catch (error) {
          console.error('Failed to load cart from server', error);
          setCartItems([]);
        }
      } else {
        // Guest: load from localStorage
        const storedCart = localStorage.getItem('aura_cart_guest');
        setCartItems(storedCart ? JSON.parse(storedCart) : []);
      }
    };
    loadCart();
  }, [user]);

  // Persist cart whenever it changes
  useEffect(() => {
    if (!user) {
      localStorage.setItem('aura_cart_guest', JSON.stringify(cartItems));
    } else {
      const syncCart = async () => {
        try {
          await fetch(`/api/cart/${user.email}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeader()
            },
            body: JSON.stringify({ cartItems })
          });
        } catch (error) {
          console.error('Failed to sync cart to server', error);
        }
      };
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
        item.id === productId && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (!user) localStorage.removeItem('aura_cart_guest');
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
