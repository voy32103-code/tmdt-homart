import { apiCall } from './client';

export const reportApi = {
  getOverview: (queryParams, token) => apiCall(`/api/admin/reports/overview${queryParams ? `?${queryParams}` : ''}`, {}, token),
  getRevenueByDate: (queryParams, token) => apiCall(`/api/admin/reports/revenue-by-date${queryParams ? `?${queryParams}` : ''}`, {}, token),
  getTopProducts: (queryParams, token) => apiCall(`/api/admin/reports/top-products${queryParams ? `?${queryParams}` : ''}`, {}, token),
  getRevenueByCategory: (queryParams, token) => apiCall(`/api/admin/reports/revenue-by-category${queryParams ? `?${queryParams}` : ''}`, {}, token),
  getOrderStatusSummary: (queryParams, token) => apiCall(`/api/admin/reports/order-status-summary${queryParams ? `?${queryParams}` : ''}`, {}, token)
};
