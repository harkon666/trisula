import axios from 'axios';
import { toast } from 'sonner';

// Handle API URL handling (ensure /api prefix)
const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const baseURL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            toast.error("Akses Ditolak: Anda tidak memiliki wewenang");
        }
        return Promise.reject(error);
    }
);

export default api;
