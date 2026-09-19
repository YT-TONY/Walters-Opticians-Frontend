// src/api/client.ts
import axios from 'axios';

export const AUTH_TOKEN_KEY = 'walters_auth_token';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Active Request Tracker for Global Loading Dock
let activeRequests = 0;

const notifyLoadingState = () => {
  window.dispatchEvent(
    new CustomEvent('api-loading-change', { detail: { isLoading: activeRequests > 0 } })
  );
};

// Request Interceptor: Attach Token & Start Loading
apiClient.interceptors.request.use(
  (config) => {
    activeRequests++;
    notifyLoadingState();

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyLoadingState();
    return Promise.reject(error);
  }
);

// Response Interceptor: Stop Loading & Handle Errors
apiClient.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyLoadingState();
    return response;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyLoadingState();

    if (error.response && error.response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);

      const publicAuthRoutes = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/complete-profile',
      ];

      const isPublicAuthPage = publicAuthRoutes.includes(window.location.pathname);
      if (!isPublicAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);