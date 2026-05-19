const API_BASE_URL = 'http://localhost:3001/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const api = {
  // Auth
  register: async (username, email, password, name) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, email, password, name })
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  // Products
  getProducts: async () => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getProduct: async (id) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createProduct: async (product_name, description, price, stock_quantity) => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_name, description, price, stock_quantity })
    });
    return res.json();
  },

  updateProduct: async (id, updates) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Orders
  createOrder: async (items) => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items })
    });
    return res.json();
  },

  getUserOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getAllOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getOrder: async (id) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Payments
  createPayment: async (orderId, paymentMethod) => {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, paymentMethod })
    });
    return res.json();
  },

  getOrderPayments: async (orderId) => {
    const res = await fetch(`${API_BASE_URL}/payments/order/${orderId}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getAllPayments: async () => {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updatePaymentStatus: async (paymentId, status) => {
    const res = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};
