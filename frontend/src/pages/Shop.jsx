import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load products", err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  if (loading) {
    return <div className="shop-page main-content text-center"><p>Loading collection...</p></div>;
  }

  return (
    <div className="shop-page animate-fade-in main-content">
      <div className="shop-header text-center">
        <h1>The Collection</h1>
        <p>Explore our full range of impeccably crafted dresses.</p>
      </div>
      
      <div className="shop-filters">
        {categories.map(category => (
          <button 
            key={category} 
            className={`filter-btn ${filter === category ? 'active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="empty-state text-center mt-8">
          <p>No dresses found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
