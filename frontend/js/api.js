const API_BASE = '/api';

const getToken = () => localStorage.getItem('expenseiq_token');
const getUser = () => JSON.parse(localStorage.getItem('expenseiq_user') || 'null');
const setAuth = (token, user) => { localStorage.setItem('expenseiq_token', token); localStorage.setItem('expenseiq_user', JSON.stringify(user)); };
const clearAuth = () => { localStorage.removeItem('expenseiq_token'); localStorage.removeItem('expenseiq_user'); };

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
});

const request = async (method, url, body = null) => {
  const opts = { method, headers: headers() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const API = {
  auth: {
    register: (data) => request('POST', '/auth/register', data),
    verifyOTP: (data) => request('POST', '/auth/verify-otp', data),
    resendOTP: (data) => request('POST', '/auth/resend-otp', data),
    login: (data) => request('POST', '/auth/login', data),
    guest: () => request('POST', '/auth/guest'),
    me: () => request('GET', '/auth/me'),
    updateProfile: (data) => request('PUT', '/auth/profile', data),
    changePassword: (data) => request('PUT', '/auth/change-password', data),
  },
  expenses: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/expenses${qs ? '?' + qs : ''}`);
    },
    getStats: () => request('GET', '/expenses/stats'),
    add: (data) => request('POST', '/expenses', data),
    update: (id, data) => request('PUT', `/expenses/${id}`, data),
    delete: (id) => request('DELETE', `/expenses/${id}`),
  },
  goals: {
    getAll: () => request('GET', '/goals'),
    create: (data) => request('POST', '/goals', data),
    update: (id, data) => request('PUT', `/goals/${id}`, data),
    addAmount: (id, amount) => request('POST', `/goals/${id}/add`, { amount }),
    delete: (id) => request('DELETE', `/goals/${id}`),
  },
  badges: {
    getAll: () => request('GET', '/badges'),
    award: (badgeName) => request('POST', '/badges/award', { badgeName }),
  }
};

const requireAuth = () => {
  if (!getToken()) { window.location.href = '/login.html'; return false; }
  return true;
};

const formatCurrency = (amount, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
  return `${symbols[currency] || '$'}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const showToast = (message, type = 'success') => {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3500);
};

window.API = API;
window.getToken = getToken;
window.getUser = getUser;
window.setAuth = setAuth;
window.clearAuth = clearAuth;
window.requireAuth = requireAuth;
window.formatCurrency = formatCurrency;
window.showToast = showToast;
