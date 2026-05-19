import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Products({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await api.getProducts();
      if (Array.isArray(result)) {
        setProducts(result);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"></div>;

  return (
    <div>
      <h2 className="products-title" style={{ marginBottom: '1.5rem' }}>
        Available Products
      </h2>
      {error && <div className="error">{error}</div>}
      {products.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>No products available</p>
      ) : (
        <div className="products-container">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-info">
                <h3 className="product-name">{product.product_name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <div>
                    <div className="product-price">RM{product.price}</div>
                    <div className="product-stock">
                      Stock: {product.stock_quantity}
                    </div>
                  </div>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock_quantity === 0}
                  >
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
