const BASE_URL = 'http://localhost:5000';

const getToken = () => {
  return localStorage.getItem('token') || '';
};

const headers = (isFormData = false) => {
  const h = { Authorization: `Bearer ${getToken()}` };
  if (!isFormData) h['Content-Type'] = 'application/json';
  return h;
};

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login: (data) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  register: (data) =>
    fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
};

// ── Products ──────────────────────────────────────────────────
export const productAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/api/products?${q}`)
      .then(r => r.json());
  },

  getById: (id) =>
    fetch(`${BASE_URL}/api/products/${id}`)
      .then(r => r.json()),

  getFeatured: () =>
    fetch(`${BASE_URL}/api/products/featured`)
      .then(r => r.json()),

  create: (formData) =>
    fetch(`${BASE_URL}/api/products`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body:    formData,
    }).then(r => r.json()),

  update: (id, formData) =>
    fetch(`${BASE_URL}/api/products/${id}`, {
      method:  'PUT',
      headers: { Authorization: `Bearer ${getToken()}` },
      body:    formData,
    }).then(r => r.json()),

  delete: (id) =>
    fetch(`${BASE_URL}/api/products/${id}`, {
      method:  'DELETE',
      headers: headers(),
    }).then(r => r.json()),

  addReview: (id, data) =>
    fetch(`${BASE_URL}/api/products/${id}/reviews`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(data),
    }).then(r => r.json()),
};

// ── Orders ────────────────────────────────────────────────────
export const orderAPI = {
  create: (data) =>
    fetch(`${BASE_URL}/api/orders`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(data),
    }).then(r => r.json()),

  getMyOrders: () =>
    fetch(`${BASE_URL}/api/orders/myorders`, {
      headers: headers(),
    }).then(r => r.json()),

  getAll: () =>
    fetch(`${BASE_URL}/api/orders`, {
      headers: headers(),
    }).then(r => r.json()),

  markPaid: (id) =>
    fetch(`${BASE_URL}/api/orders/${id}/pay`, {
      method:  'PUT',
      headers: headers(),
    }).then(r => r.json()),
};