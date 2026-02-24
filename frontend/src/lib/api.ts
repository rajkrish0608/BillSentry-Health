import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: add auth token if available
api.interceptors.request.use(
    (config) => {
        // We can't access Zustand directly cleanly outside React without importing the store,
        // so we'll grab it from localStorage if it's persisted, or pass it explicitly.
        // Zustand persist stores it under 'auth-storage' by default
        if (typeof window !== 'undefined') {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                try {
                    const parsed = JSON.parse(authStorage);
                    const token = parsed.state?.token;
                    if (token && config.headers) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (e) {
                    console.error('Failed to parse auth token from local storage', e);
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: handle global errors like 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear local storage and redirect to login if token is invalid/expired
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth-storage');
                // Don't auto-redirect if we are already on login/register to avoid loops
                if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
