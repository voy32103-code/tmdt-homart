import { apiCall } from './client';

export const orderApi = {
  create: (data) => apiCall('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  getByCode: (code) => apiCall(`/api/orders/code/${code}`),
  getByPhone: (phone) => apiCall(`/api/orders/phone/${phone}`),
  getAllAdmin: (token) => apiCall('/api/admin/orders', {}, token),
  updateStatusAdmin: (id, status, token) => apiCall(`/api/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }, token)
};
