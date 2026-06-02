import api from './api';

const authService = {
    login: (data) => api.post('/auth/login', data).then(r => r.data),
    register: (data) => api.post('/auth/register', data).then(r => r.data),
    getMe: () => api.get('/auth/me').then(r => r.data),
};

export default authService; 