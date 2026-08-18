import API from './api';

export const dashboardService = {
  getDashboard: () => API.get('/dashboard'),
  getAllUsers: () => API.get('/dashboard/admin/users'),
  deleteUser: (id) => API.delete(`/dashboard/admin/users/${id}`),
};
