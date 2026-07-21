import { useState, useCallback } from 'react';
import { orderApi } from '../api/orderApi';
import { useAuthStore } from '../stores/authStore';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useAuthStore(state => state.token);

  const fetchAdminOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.getAllAdmin(token);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { orders, loading, error, fetchAdminOrders, setOrders };
}
