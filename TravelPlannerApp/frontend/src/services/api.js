import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
});

export const travelApi = axios.create({
    baseURL: import.meta.env.VITE_TRAVEL_API_BASE_URL + '/api',
});

const addInterceptors = (instance) => {
    instance.interceptors.request.use(config => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });
    instance.interceptors.response.use(
        res => res,
        err => {
            if (err.response?.status === 401) {
                const url = err.config?.url || '';
                if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
            return Promise.reject(err);
        }
    );
};

addInterceptors(api);
addInterceptors(travelApi);

export default api;