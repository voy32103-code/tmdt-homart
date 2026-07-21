import { apiCall } from './client';

export const commentApi = {
  getByProductId: (productId) => apiCall(`/api/products/${productId}/comments`),
  addComment: (productId, data) => apiCall(`/api/products/${productId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  getAllAdmin: (token) => apiCall('/api/admin/comments', {}, token),
  deleteAdmin: (id, token) => apiCall(`/api/admin/comments/${id}`, { method: 'DELETE' }, token)
};
