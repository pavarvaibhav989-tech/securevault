import API from './api';

export const idsService = {
  getLogs: (params) => API.get('/ids/logs', { params }),
  detectAttack: (data) => API.post('/ids/detect', data),
  getStats: () => API.get('/ids/stats'),
  deleteLog: (id) => API.delete(`/ids/logs/${id}`),
};
