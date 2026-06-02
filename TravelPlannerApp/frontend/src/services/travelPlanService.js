import api from './api';

const travelPlanService = {
    getAll: () => api.get('/travel-plans').then(r => r.data),
    getById: (id) => api.get(`/travel-plans/${id}`).then(r => r.data),
    create: (data) => api.post('/travel-plans', data).then(r => r.data),
    update: (id, data) => api.put(`/travel-plans/${id}`, data).then(r => r.data),
    delete: (id) => api.delete(`/travel-plans/${id}`),

    getDestinations: (pid) => api.get(`/travel-plans/${pid}/destinations`).then(r => r.data),
    addDestination: (pid, d) => api.post(`/travel-plans/${pid}/destinations`, d).then(r => r.data),
    updateDestination: (pid, id, d) => api.put(`/travel-plans/${pid}/destinations/${id}`, d).then(r => r.data),
    deleteDestination: (pid, id) => api.delete(`/travel-plans/${pid}/destinations/${id}`),

    getActivities: (pid) => api.get(`/travel-plans/${pid}/activities`).then(r => r.data),
    addActivity: (pid, a) => api.post(`/travel-plans/${pid}/activities`, a).then(r => r.data),
    updateActivity: (pid, id, a) => api.put(`/travel-plans/${pid}/activities/${id}`, a).then(r => r.data),
    deleteActivity: (pid, id) => api.delete(`/travel-plans/${pid}/activities/${id}`),

    getExpenses: (pid) => api.get(`/travel-plans/${pid}/expenses`).then(r => r.data),
    addExpense: (pid, e) => api.post(`/travel-plans/${pid}/expenses`, e).then(r => r.data),
    updateExpense: (pid, id, e) => api.put(`/travel-plans/${pid}/expenses/${id}`, e).then(r => r.data),
    deleteExpense: (pid, id) => api.delete(`/travel-plans/${pid}/expenses/${id}`),

    getChecklist: (pid) => api.get(`/travel-plans/${pid}/checklist`).then(r => r.data),
    addChecklistItem: (pid, c) => api.post(`/travel-plans/${pid}/checklist`, c).then(r => r.data),
    toggleChecklist: (pid, id) => api.patch(`/travel-plans/${pid}/checklist/${id}/toggle`).then(r => r.data),
    deleteChecklistItem: (pid, id) => api.delete(`/travel-plans/${pid}/checklist/${id}`),

    createShareToken: (pid, accessType) =>
        api.post(`/travel-plans/${pid}/share`, { accessType }).then(r => r.data),
    getByToken: (token) => api.get(`/shared/${token}`).then(r => r.data),
};

export default travelPlanService;