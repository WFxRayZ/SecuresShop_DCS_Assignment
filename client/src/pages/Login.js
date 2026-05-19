import React, { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin, onSwitchPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        onLogin(result.user, result.token);
      }
    } catch (err) {
      setError('Network error. Make sure the server is running on http://localhost:3001');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Login to SecureShop</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Admin123!"
          />
        </div>
        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="switch-link">
        Don't have an account?{' '}
        <button onClick={onSwitchPage}>Register here</button>
      </div>
    </div>
  );
}
