import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await api.getUserOrders();
      if (Array.isArray(result)) {
        setOrders(result);
      } else {
        setError('Failed to load orders');
      }
    } catch (err) {
      setError('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"></div>;

  const groupedOrders = {};
  orders.forEach((item) => {
    if (!groupedOrders[item.id]) {
      groupedOrders[item.id] = {
        id: item.id,
        order_date: item.order_date,
        total_amount: item.total_amount,
        status: item.status,
        items: []
      };
    }
    if (item.product_name) {
      groupedOrders[item.id].items.push({
        name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      });
    }
  });

  const orderList = Object.values(groupedOrders).reverse();

  return (
    <div className="orders-container">
      <h2 className="orders-title">My Orders</h2>
      {error && <div className="error">{error}</div>}
      {orderList.length === 0 ? (
        <div className="orders-empty">You haven't placed any orders yet</div>
      ) : (
        orderList.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <div className="order-id">Order #{order.id}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {new Date(order.order_date).toLocaleDateString()}
                </div>
              </div>
              <span className={`order-status status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div className="order-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>${item.subtotal?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="order-total">
              Total: ${order.total_amount?.toFixed(2) || '0.00'}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
