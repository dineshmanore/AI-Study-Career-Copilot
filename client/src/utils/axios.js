import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// 401 interceptor — redirect to login on unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if already on auth pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/dashboard') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
