import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    stock_quantity: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'products') {
        const result = await api.getProducts();
        if (Array.isArray(result)) setProducts(result);
      } else if (activeTab === 'orders') {
        const result = await api.getAllOrders();
        if (Array.isArray(result)) setOrders(result);
      } else if (activeTab === 'payments') {
        const result = await api.getAllPayments();
        if (Array.isArray(result)) setPayments(result);
      }
    } catch (err) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const result = await api.createProduct(
        formData.product_name,
        formData.description,
        parseFloat(formData.price),
        parseInt(formData.stock_quantity)
      );

      if (result.error) {
        setError(result.error);
      } else {
        setProducts([...products, result]);
        setFormData({ product_name: '', description: '', price: '', stock_quantity: '' });
      }
    } catch (err) {
      setError('Error creating product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      setError('Error deleting product');
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, status) => {
    try {
      const result = await api.updatePaymentStatus(paymentId, status);
      if (!result.error) {
        loadData();
      }
    } catch (err) {
      setError('Error updating payment');
    }
  };

  const groupedOrders = {};
  orders.forEach((item) => {
    if (!groupedOrders[item.id]) {
      groupedOrders[item.id] = {
        id: item.id,
        user_id: item.user_id,
        customer_name: item.customer_name,
        email: item.email,
        order_date: item.order_date,
        total_amount: item.total_amount,
        status: item.status,
        items: []
      };
    }
    if (item.product_name) {
      groupedOrders[item.id].items.push({
        name: item.product_name,
        quantity: item.quantity
      });
    }
  });

  return (
    <div className="admin-container">
      <h1 style={{ marginBottom: '1.5rem' }}>Admin Panel</h1>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`admin-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Products Tab */}
      <div className={`admin-section ${activeTab === 'products' ? 'active' : ''}`}>
        <h2 style={{ marginBottom: '1.5rem' }}>Manage Products</h2>

        <form onSubmit={handleAddProduct} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Add New Product</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Product Name"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="number"
              placeholder="Price"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', gridColumn: '1 / -1' }}
            ></textarea>
            <input
              type="number"
              placeholder="Stock Quantity"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              required
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <button type="submit" className="form-btn" style={{ marginTop: 'auto' }}>
              Add Product
            </button>
          </div>
        </form>

        <h3 style={{ marginBottom: '1rem' }}>Product List</h3>
        {loading ? (
          <div className="loading"></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.product_name}</td>
                    <td>${product.price}</td>
                    <td>{product.stock_quantity}</td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders Tab */}
      <div className={`admin-section ${activeTab === 'orders' ? 'active' : ''}`}>
        <h2 style={{ marginBottom: '1.5rem' }}>All Orders</h2>
        {loading ? (
          <div className="loading"></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(groupedOrders).map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>${order.total_amount?.toFixed(2)}</td>
                    <td>
                      <span className={`order-status status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payments Tab */}
      <div className={`admin-section ${activeTab === 'payments' ? 'active' : ''}`}>
        <h2 style={{ marginBottom: '1.5rem' }}>Payment Management</h2>
        {loading ? (
          <div className="loading"></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>#{payment.id}</td>
                    <td>#{payment.order_id}</td>
                    <td>{payment.customer_name}</td>
                    <td>${payment.total_amount?.toFixed(2)}</td>
                    <td>{payment.payment_method}</td>
                    <td>
                      <select
                        value={payment.payment_status}
                        onChange={(e) => handleUpdatePaymentStatus(payment.id, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
