import API from './api';

export const firewallService = {
  getRules: () => API.get('/firewall/rules'),
  addRule: (data) => API.post('/firewall/rules', data),
  updateRule: (id, data) => API.put(`/firewall/rules/${id}`, data),
  deleteRule: (id) => API.delete(`/firewall/rules/${id}`),
  simulatePacket: (data) => API.post('/firewall/simulate', data),
  seedDefaults: () => API.post('/firewall/seed-defaults'),
};
