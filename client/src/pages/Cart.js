import React, { useState } from 'react';
import { api } from '../api';

export default function Cart({ cart, onRemove, onUpdate, onClear }) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create order
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      const orderResult = await api.createOrder(items);
      if (orderResult.error) {
        setError(orderResult.error);
        return;
      }

      // Create payment
      const paymentResult = await api.createPayment(orderResult.orderId, paymentMethod);
      if (paymentResult.error) {
        setError(paymentResult.error);
        return;
      }

      setSuccess(`Order created! Order ID: ${orderResult.orderId}`);
      onClear();
      setPaymentMethod('credit_card');
    } catch (err) {
      setError('Error processing checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Shopping Cart</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {cart.length === 0 ? (
        <div className="cart-empty">Your cart is empty</div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product_name}</div>
                  <div className="cart-item-price">${item.price}</div>
                </div>

                <div className="quantity-control">
                  <button onClick={() => onUpdate(item.id, item.quantity - 1)}>
                    −
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdate(item.id, parseInt(e.target.value) || 0)}
                    min="1"
                  />
                  <button onClick={() => onUpdate(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <div style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <button className="remove-btn" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-total">Total: ${total.toFixed(2)}</div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Payment Method:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="cart-actions">
              <button
                className="clear-cart-btn"
                onClick={onClear}
                disabled={loading}
              >
                Clear Cart
              </button>
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
