import api, { travelApi } from './api';

const adminService = {
    getUsers: () => api.get('/admin/users').then(r => r.data),
    updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getAllPlans: () => travelApi.get('/travel-plans/admin/all').then(r => r.data),
};

export default adminService;