import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setProduct(null);
        } else {
          setProduct(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load product", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="main-content text-center mt-8"><p>Loading product...</p></div>;
  }

  if (!product) {
    return (
      <div className="main-content text-center mt-8">
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-primary mt-2">Return to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="product-details-page animate-fade-in main-content">
      <div className="breadcrumb">
        <Link to="/">Home</Link> <ChevronRight size={14} /> 
        <Link to="/shop">Shop</Link> <ChevronRight size={14} /> 
        <span>{product.name}</span>
      </div>

      <div className="product-details-grid">
        <div className="product-details-image">
          <img src={product.image} alt={product.name} />
        </div>
        
        <div className="product-details-info">
          <span className="product-category">{product.category}</span>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">${product.price.toFixed(2)}</p>
          
          <div className="product-description">
            <p>{product.description}</p>
          </div>
          
          <div className="size-selector">
            <div className="size-header">
              <span className="size-label">Size</span>
              <button className="size-guide-btn">Size Guide</button>
            </div>
            <div className="size-options">
              {sizes.map(size => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <div className="product-actions">
            <button 
              className={`btn ${added ? 'btn-accent' : 'btn-primary'} add-to-cart-btn`}
              onClick={handleAddToCart}
            >
              {added ? 'Added to Cart' : 'Add to Cart'}
            </button>
            <button className="wishlist-btn">
              <Heart size={24} />
            </button>
          </div>

          <div className="product-meta">
            <div className="meta-item">
              <strong>Materials:</strong> 100% Premium Material
            </div>
            <div className="meta-item">
              <strong>Care:</strong> Dry clean only
            </div>
            <div className="meta-item">
              <strong>Shipping:</strong> Free complimentary shipping worldwide
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
