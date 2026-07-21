import { apiCall } from './client';

export const authApi = {
  login: (username, password) => apiCall('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: (token) => apiCall('/api/auth/logout', { method: 'POST' }, token)
};
