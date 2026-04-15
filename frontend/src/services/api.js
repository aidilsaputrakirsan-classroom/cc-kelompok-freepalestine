import axios from 'axios';

// Base API client — endpoint mengarah ke FastAPI backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor — sisipkan JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 redirect
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH API ====================
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// ==================== SALES API ====================
export const salesApi = {
    list: (params) => api.get('/sales', { params }),
    get: (id) => api.get(`/sales/${id}`),
    create: (data) => api.post('/sales', data),
    update: (id, data) => api.put(`/sales/${id}`, data),
    delete: (id) => api.delete(`/sales/${id}`),
    summary: (params) => api.get('/sales/summary', { params }),
    monthly: (params) => api.get('/sales/monthly', { params }),
};

// ==================== INBOX API ====================
export const inboxApi = {
    list: (params) => api.get('/inbox', { params }),
    get: (id) => api.get(`/inbox/${id}`),
    create: (data) => api.post('/inbox', data),
    update: (id, data) => api.put(`/inbox/${id}`, data),
    delete: (id) => api.delete(`/inbox/${id}`),
    stats: (params) => api.get('/inbox/stats', { params }),
};

export default api;
