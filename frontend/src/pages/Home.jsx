import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.slice(0, 4));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load featured products", err);
        setLoading(false);
      });
  }, []);

  const featuredProducts = products;

  if (loading) {
    return <div className="home-page animate-fade-in"><div className="text-center p-8">Loading...</div></div>;
  }

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image-container">
          <img 
            src="/Gemini_Generated_Image_rqeabwrqeabwrqea.png" 
            alt="Elegant woman in dress" 
            className="hero-bg-image"
          />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <span className="hero-subtitle">New Collection</span>
          <h1 className="hero-title">Ethereal Elegance</h1>
          <p className="hero-text">Discover our latest arrivals featuring premium silks, delicate lace, and timeless silhouettes.</p>
          <Link to="/shop" className="btn btn-primary hero-btn">Explore Collection</Link>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="main-content section-padding">
        <div className="section-header text-center mb-4">
          <h2 className="section-title">Curated For You</h2>
          <p className="section-subtitle">Handpicked silhouettes to elevate your wardrobe.</p>
        </div>
        
        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center mt-4">
          <Link to="/shop" className="btn btn-outline">View All Dresses</Link>
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="editorial-section">
        <div className="editorial-grid">
          <div className="editorial-image">
            <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Editorial fashion" />
          </div>
          <div className="editorial-content">
            <h2>The Art of Dressing</h2>
            <p>Every piece in our collection is thoughtfully designed to celebrate the female form. We source only the finest fabrics from artisanal mills around the world, ensuring that each dress not only looks exquisite but feels extraordinary against your skin.</p>
            <Link to="/shop" className="btn btn-primary mt-2">Read Our Story</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
