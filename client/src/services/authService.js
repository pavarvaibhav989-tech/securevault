import API from './api';

export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  verifyOTP: (data) => API.post('/auth/verify-otp', data),
  resendOTP: (data) => API.post('/auth/resend-otp', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  getMe: () => API.get('/auth/me'),
  // Captcha: server exposes /api/captcha/math
  getCaptcha: () => API.get('/captcha/math'),
  getLoginHistory: () => API.get('/auth/login-history'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  // Admin user management via /api/auth/users
  getAllUsers: () => API.get('/auth/users'),
  deleteUser: (id) => API.delete(`/auth/users/${id}`),
};
