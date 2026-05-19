import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import AdminPanel from './pages/AdminPanel';
import Orders from './pages/Orders';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentPage('products');
    }
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('products');
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  const handleAddToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleUpdateCart = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">🛒 SecureShop</h1>
          {user && (
            <div className="nav-menu">
              <button
                className={`nav-btn ${currentPage === 'products' ? 'active' : ''}`}
                onClick={() => setCurrentPage('products')}
              >
                Products
              </button>
              <button
                className={`nav-btn ${currentPage === 'cart' ? 'active' : ''}`}
                onClick={() => setCurrentPage('cart')}
              >
                🛍️ Cart ({cart.length})
              </button>
              <button
                className={`nav-btn ${currentPage === 'orders' ? 'active' : ''}`}
                onClick={() => setCurrentPage('orders')}
              >
                Orders
              </button>
              {user.role === 'Admin' && (
                <button
                  className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('admin')}
                >
                  Admin
                </button>
              )}
              <div className="user-info">
                <span>Welcome, {user.username}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="main-content">
        {!user && currentPage === 'login' && (
          <Login onLogin={handleLogin} onSwitchPage={() => setCurrentPage('register')} />
        )}
        {!user && currentPage === 'register' && (
          <Register onRegister={handleLogin} onSwitchPage={() => setCurrentPage('login')} />
        )}
        {user && currentPage === 'products' && (
          <Products onAddToCart={handleAddToCart} />
        )}
        {user && currentPage === 'cart' && (
          <Cart
            cart={cart}
            onRemove={handleRemoveFromCart}
            onUpdate={handleUpdateCart}
            onClear={handleClearCart}
          />
        )}
        {user && currentPage === 'orders' && (
          <Orders />
        )}
        {user && currentPage === 'admin' && user.role === 'Admin' && (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}
