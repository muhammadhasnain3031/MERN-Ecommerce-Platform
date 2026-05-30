import axios from 'axios';

// API Base URL
// Local dev → localhost; Production → live backend
const API_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL + '/api'
  : 'https://mern-ecommerce-platform-olhz.vercel.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Auth API ──────────────────────────────────────────────────
export const authAPI = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
};

// ── Product API ───────────────────────────────────────────────
export const productAPI = {
  getAll: async (queryString = '') => {
    const { data } = await api.get(`/products?${queryString}`);
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },
  create: async (formData) => {
    const { data } = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  update: async (id, formData) => {
    const { data } = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};

// ── Order API ─────────────────────────────────────────────────
export const orderAPI = {
  create: async (orderData) => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },
  getMyOrders: async () => {
    const { data } = await api.get('/orders/myorders');
    return data;
  },
  getAllOrders: async () => {
    const { data } = await api.get('/orders');
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },
  updateStatus: async (id, status) => {
    const { data } = await api.put(`/orders/${id}/status`, { status });
    return data;
  },
  markPaid: async (id) => {
    const { data } = await api.put(`/orders/${id}/pay`);
    return data;
  },
};

// ── Cart API ──────────────────────────────────────────────────
export const cartAPI = {
  get: async () => {
    const { data } = await api.get('/cart');
    return data;
  },
  add: async (productId, quantity) => {
    const { data } = await api.post('/cart/add', { productId, quantity });
    return data;
  },
  remove: async (productId) => {
    const { data } = await api.delete(`/cart/remove/${productId}`);
    return data;
  },
  clear: async () => {
    const { data } = await api.delete('/cart/clear');
    return data;
  },
};

export default api;