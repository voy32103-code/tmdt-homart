import { apiCall } from './client';

export const vnpayApi = {
  createPaymentUrl: (orderData) => {
    return apiCall('/api/vnpay/create-payment-url', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  verifyCallback: (queryString) => {
    return apiCall(`/api/vnpay/callback${queryString}`);
  }
};
