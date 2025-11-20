import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    verify: () => api.get('/auth/verify')
};

// Dashboard APIs
export const dashboardAPI = {
    getStats: () => api.get('/admin/dashboard/stats')
};

// User APIs
export const userAPI = {
    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

// Resource APIs
export const resourceAPI = {
    getResources: (params) => api.get('/admin/resources', { params }),
    createResource: (data) => api.post('/admin/resources', data),
    updateResource: (id, data) => api.put(`/admin/resources/${id}`, data),
    deleteResource: (id) => api.delete(`/admin/resources/${id}`)
};

// Performance APIs
export const performanceAPI = {
    getPerformance: () => api.get('/admin/quiz/performance')
};

export default api;
