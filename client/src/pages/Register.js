import React, { useState } from 'react';
import { api } from '../api';

export default function Register({ onRegister, onSwitchPage }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.register(username, email, password, name);
      if (result.error) {
        setError(result.error);
      } else {
        // Auto login after registration
        const loginResult = await api.login(email, password);
        if (loginResult.error) {
          setError('Registration successful! Please login.');
          onSwitchPage();
        } else {
          onRegister(loginResult.user, loginResult.token);
        }
      }
    } catch (err) {
      setError('Network error. Make sure the server is running on http://localhost:3001');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Create SecureShop Account</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="johnsmith"
          />
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Smith"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john@example.com"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimum 8 characters"
          />
        </div>
        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <div className="switch-link">
        Already have an account?{' '}
        <button onClick={onSwitchPage}>Login here</button>
      </div>
    </div>
  );
}
