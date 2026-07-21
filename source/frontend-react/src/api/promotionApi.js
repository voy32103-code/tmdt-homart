import { apiCall } from './client';

export const promotionApi = {
  getAll: () => apiCall('/api/promotions'),
  create: (data, token) => apiCall('/api/promotions', { method: 'POST', body: JSON.stringify(data) }, token),
  update: (id, data, token) => apiCall(`/api/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  delete: (id, token) => apiCall(`/api/promotions/${id}`, { method: 'DELETE' }, token)
};
