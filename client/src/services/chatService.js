import API from './api';

export const chatService = {
  getUsers: () => API.get('/chat/users'),
  getMessages: (userId) => API.get(`/chat/messages/${userId}`),
  sendMessage: (data) => API.post('/chat/send', data),
};
