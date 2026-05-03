import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty main-content animate-fade-in text-center">
        <ShoppingBag size={64} className="empty-cart-icon" />
        <h2>Your cart is empty</h2>
        <p className="mt-2 mb-4 text-secondary">Looks like you haven't added any dresses yet.</p>
        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
      alert("Please log in to proceed to checkout.");
      return;
    }
    alert("Mock Checkout Successful! Thank you for your purchase.");
    clearCart();
  };

  return (
    <div className="cart-page main-content animate-fade-in">
      <h1 className="cart-title">Your Cart</h1>
      
      <div className="cart-container">
        <div className="cart-items">
          <div className="cart-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>
          
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.size}`} className="cart-item">
              <div className="item-details">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-info">
                  <span className="item-category">{item.category}</span>
                  <h3><Link to={`/product/${item.id}`}>{item.name}</Link></h3>
                  <p className="item-size">Size: {item.size}</p>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="item-quantity">
                <button 
                  onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                  className="qty-btn"
                >
                  <Minus size={16} />
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                  className="qty-btn"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="item-total">
                <p>${(item.price * item.quantity).toFixed(2)}</p>
                <button 
                  onClick={() => removeFromCart(item.id, item.size)}
                  className="remove-btn"
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          
          <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          
          {!user && (
            <p className="login-prompt">
              <Link to="/login">Log in</Link> to save your cart and checkout faster.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
