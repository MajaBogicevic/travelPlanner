import api from './api';

const adminService = {
    getUsers: () => api.get('/admin/users').then(r => r.data),
    updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default adminService;