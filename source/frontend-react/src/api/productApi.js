import { apiCall } from './client';

export const productApi = {
  getSummary: (token) => apiCall('/api/summary', {}, token),
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return apiCall(`/api/products${searchParams ? `?${searchParams}` : ''}`);
  },
  getById: (id) => apiCall(`/api/products/${id}`),
  create: (data, token) => apiCall('/api/products', { method: 'POST', body: JSON.stringify(data) }, token),
  update: (id, data, token) => apiCall(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  delete: (id, token) => apiCall(`/api/products/${id}`, { method: 'DELETE' }, token),
  addPriceHistory: (data, token) => apiCall('/api/prices', { method: 'POST', body: JSON.stringify(data) }, token)
};
