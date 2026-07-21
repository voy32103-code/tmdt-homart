import { apiCall } from './client';

export const categoryApi = {
  getAll: () => apiCall('/api/categories'),
  getById: (id) => apiCall(`/api/categories/${id}`),
  create: (data, token) => apiCall('/api/categories', { method: 'POST', body: JSON.stringify(data) }, token),
  update: (id, data, token) => apiCall(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  delete: (id, token) => apiCall(`/api/categories/${id}`, { method: 'DELETE' }, token)
};
