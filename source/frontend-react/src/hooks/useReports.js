import { useState, useCallback } from 'react';
import { reportApi } from '../api/reportApi';
import { useAuthStore } from '../stores/authStore';

export function useReports(reportFromDate = '', reportToDate = '') {
  const [overviewKpis, setOverviewKpis] = useState({ totalRevenue: 0, totalOrders: 0, completedOrders: 0, cancelledOrders: 0 });
  const [revenueByDate, setRevenueByDate] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [orderStatusSummary, setOrderStatusSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = useAuthStore(state => state.token);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (reportFromDate) params.append('from', reportFromDate);
    if (reportToDate) params.append('to', reportToDate);
    const queryParams = params.toString();

    try {
      const [overview, dailyRevenue, topProds, catRevenue, statusSumm] = await Promise.all([
        reportApi.getOverview(queryParams, token),
        reportApi.getRevenueByDate(queryParams, token),
        reportApi.getTopProducts(queryParams, token),
        reportApi.getRevenueByCategory(queryParams, token),
        reportApi.getOrderStatusSummary(queryParams, token)
      ]);

      setOverviewKpis(overview);
      setRevenueByDate(dailyRevenue);
      setTopProducts(topProds);
      setRevenueByCategory(catRevenue);
      setOrderStatusSummary(statusSumm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, reportFromDate, reportToDate]);

  return {
    overviewKpis,
    revenueByDate,
    topProducts,
    revenueByCategory,
    orderStatusSummary,
    loading,
    error,
    fetchReports
  };
}
