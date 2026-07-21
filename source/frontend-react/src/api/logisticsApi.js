import { apiCall } from './client';

export const logisticsApi = {
  getAllCompanies: () => apiCall('/api/logistics-companies'),
  getAllCompaniesAdmin: (token) => apiCall('/api/admin/logistics-companies', {}, token),
  createCompany: (data, token) => apiCall('/api/admin/logistics-companies', { method: 'POST', body: JSON.stringify(data) }, token),
  updateCompany: (id, data, token) => apiCall(`/api/admin/logistics-companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  deleteCompany: (id, token) => apiCall(`/api/admin/logistics-companies/${id}`, { method: 'DELETE' }, token),

  getAllPartnersAdmin: (token) => apiCall('/api/admin/store-logistics-partners', {}, token),
  createPartner: (data, token) => apiCall('/api/admin/store-logistics-partners', { method: 'POST', body: JSON.stringify(data) }, token),
  updatePartner: (id, data, token) => apiCall(`/api/admin/store-logistics-partners/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  deletePartner: (id, token) => apiCall(`/api/admin/store-logistics-partners/${id}`, { method: 'DELETE' }, token)
};
