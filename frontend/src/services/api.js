// src/services/api.js
import BASE_URL from '../api';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ── Order API ─────────────────────────────────────────────────
export const orderAPI = {
  create: async (orderData) => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Order failed');
    return data;
  },

  getMyOrders: async () => {
    const res = await fetch(`${BASE_URL}/api/orders/myorders`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  getAll: async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  updateStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
      method:  'PUT',
      headers: authHeaders(),
      body:    JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed');
    return data;
  },
};

// ── Product API ───────────────────────────────────────────────
export const productAPI = {
  getAll: async (params = '') => {
    const res  = await fetch(`${BASE_URL}/api/products?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  getById: async (id) => {
    const res  = await fetch(`${BASE_URL}/api/products/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  addReview: async (id, reviewData) => {
    const res = await fetch(`${BASE_URL}/api/products/${id}/reviews`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(reviewData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed');
    return data;
  },
};