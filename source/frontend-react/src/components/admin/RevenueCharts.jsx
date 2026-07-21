import React, { useMemo } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function RevenueCharts({ revenueByDate, topProducts, revenueByCategory, orderStatusSummary }) {
  const lineChartData = useMemo(() => ({
    labels: revenueByDate.map(item => item.date),
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: revenueByDate.map(item => item.totalRevenue),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1
      }
    ]
  }), [revenueByDate]);

  const barChartData = useMemo(() => ({
    labels: topProducts.map(item => item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name),
    datasets: [
      {
        label: 'Số lượng bán',
        data: topProducts.map(item => item.totalQuantity),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        borderWidth: 1
      }
    ]
  }), [topProducts]);

  const doughnutChartData = useMemo(() => ({
    labels: revenueByCategory.map(item => item.categoryName),
    datasets: [
      {
        data: revenueByCategory.map(item => item.totalRevenue),
        backgroundColor: ['#06b6d4', '#10b981', '#6366f1', '#f43f5e', '#eab308', '#a855f7']
      }
    ]
  }), [revenueByCategory]);

  const pieChartData = useMemo(() => {
    const statusLabelsMapping = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao hàng',
      completed: 'Đã hoàn thành',
      cancelled: 'Đã hủy'
    };
    const statusColorsMapping = {
      pending: '#eab308',
      confirmed: '#06b6d4',
      processing: '#3b82f6',
      shipping: '#a855f7',
      completed: '#22c55e',
      cancelled: '#ef4444'
    };

    return {
      labels: orderStatusSummary.map(item => statusLabelsMapping[item.status] || item.status),
      datasets: [
        {
          data: orderStatusSummary.map(item => item.count),
          backgroundColor: orderStatusSummary.map(item => statusColorsMapping[item.status] || '#94a3b8')
        }
      ]
    };
  }, [orderStatusSummary]);

  return (
    <div className="charts-grid">
      <div className="chart-container card">
        <h3>Doanh thu theo ngày (VNĐ)</h3>
        <div className="chart-canvas-wrap">
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: { y: { beginAtZero: true, ticks: { callback: (v) => v.toLocaleString('vi-VN') + ' đ' } } }
            }}
          />
        </div>
      </div>

      <div className="chart-container card">
        <h3>Top 10 sản phẩm bán chạy</h3>
        <div className="chart-canvas-wrap">
          <Bar
            data={barChartData}
            options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true } } }}
          />
        </div>
      </div>

      <div className="chart-container card">
        <h3>Doanh thu theo danh mục</h3>
        <div className="chart-canvas-wrap">
          <Doughnut
            data={doughnutChartData}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
          />
        </div>
      </div>

      <div className="chart-container card">
        <h3>Trạng thái đơn hàng</h3>
        <div className="chart-canvas-wrap">
          <Pie
            data={pieChartData}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
          />
        </div>
      </div>
    </div>
  );
}
