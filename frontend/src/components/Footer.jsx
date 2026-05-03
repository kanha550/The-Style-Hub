import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>AURA</h3>
          <p>Curated elegance for every occasion. Discover your perfect silhouette.</p>
          <div className="social-links">
            <a href="#">IG</a>
          </div>
        </div>
        
        <div className="footer-links">
          <h4>Shop</h4>
          <Link to="/shop">New Arrivals</Link>
          <Link to="/shop">Evening Wear</Link>
          <Link to="/shop">Bridal</Link>
          <Link to="/shop">Sale</Link>
        </div>

        <div className="footer-links">
          <h4>Assistance</h4>
          <Link to="#">Shipping & Returns</Link>
          <Link to="#">Size Guide</Link>
          <Link to="#">FAQ</Link>
          <Link to="#">Contact Us</Link>
        </div>

        <div className="footer-newsletter">
          <h4>Newsletter</h4>
          <p>Subscribe for early access to new collections.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" className="form-input" required />
            <button type="submit" className="btn btn-primary mt-1">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Aura Dress Selection. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
