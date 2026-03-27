import { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { api } from '../lib/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title)

const monthsLabel = 'Last 12 months'

const chartTitleOptions = {
  plugins: {
    legend: { display: false },
  },
  maintainAspectRatio: false,
  responsive: true,
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalytics()
        setAnalytics(data)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('Unable to load analytics data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const formatCurrency = (value) => {
    return `KSH ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`
  }

  const revenueChart = useMemo(() => {
    const labels = analytics?.monthlyRevenue?.map(item => item.label) || []
    const data = analytics?.monthlyRevenue?.map(item => item.value) || []
    return {
      labels,
      datasets: [
        {
          label: 'Revenue (KSH)',
          data,
          borderColor: '#4a9eff',
          backgroundColor: 'rgba(74, 158, 255, 0.15)',
          tension: 0.35,
          fill: true,
          pointRadius: 4,
        },
      ],
    }
  }, [analytics])

  const ordersChart = useMemo(() => {
    const labels = analytics?.monthlyOrders?.map(item => item.label) || []
    const data = analytics?.monthlyOrders?.map(item => item.value) || []
    return {
      labels,
      datasets: [
        {
          label: 'Orders',
          data,
          backgroundColor: 'rgba(76, 201, 240, 0.6)',
          borderColor: '#48b0d9',
        },
      ],
    }
  }, [analytics])

  const usersChart = useMemo(() => {
    const labels = analytics?.monthlyNewUsers?.map(item => item.label) || []
    const data = analytics?.monthlyNewUsers?.map(item => item.value) || []
    return {
      labels,
      datasets: [
        {
          label: 'New Users',
          data,
          backgroundColor: 'rgba(111, 66, 193, 0.6)',
          borderColor: '#6f42c1',
        },
      ],
    }
  }, [analytics])

  const statusChart = useMemo(() => {
    const statuses = analytics?.orderStatusBreakdown || []
    const labels = statuses.map(item => item.status.replace('_', ' '))
    const data = statuses.map(item => item.count)

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#f59e0b',
            '#0ea5e9',
            '#22c55e',
            '#6366f1',
            '#a855f7',
            '#ef4444',
            '#94a3b8',
          ],
        },
      ],
    }
  }, [analytics])

  if (loading) {
    return <div className="loading-container"><p>Loading analytics...</p></div>
  }

  if (error) {
    return <div className="error-state"><p>{error}</p></div>
  }

  if (!analytics) {
    return <div className="error-state"><p>No analytics data available.</p></div>
  }

  const paidOrders = analytics.orderStatusBreakdown?.find(item => item.status === 'PAID')?.count || 0

  return (
    <div className="analytics-page">
      <h1>Analytics Dashboard</h1>
      <p className="analytics-subtitle">Live overview of store performance and customer behaviour</p>

      <div className="analytics-stats-grid">
        <div className="analytics-stat-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">{formatCurrency(analytics.totalRevenue)}</span>
        </div>
        <div className="analytics-stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{analytics.totalOrders.toLocaleString()}</span>
        </div>
        <div className="analytics-stat-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{analytics.totalUsers.toLocaleString()}</span>
        </div>
        <div className="analytics-stat-card">
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{analytics.totalProducts.toLocaleString()}</span>
        </div>
        <div className="analytics-stat-card">
          <span className="stat-label">Average Order Value</span>
          <span className="stat-value">{formatCurrency(analytics.averageOrderValue)}</span>
        </div>
        <div className="analytics-stat-card">
          <span className="stat-label">Paid Orders</span>
          <span className="stat-value">{paidOrders.toLocaleString()}</span>
        </div>
      </div>

      <div className="analytics-charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h2>Revenue Trend</h2>
            <span>{monthsLabel}</span>
          </div>
          <div className="chart-content">
            <Line data={revenueChart} options={{ ...chartTitleOptions, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>Orders Volume</h2>
            <span>{monthsLabel}</span>
          </div>
          <div className="chart-content">
            <Bar data={ordersChart} options={chartTitleOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>New Customers</h2>
            <span>{monthsLabel}</span>
          </div>
          <div className="chart-content">
            <Bar data={usersChart} options={chartTitleOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>Order Status Mix</h2>
            <span>All time</span>
          </div>
          <div className="chart-content doughnut">
            <Doughnut data={statusChart} options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="top-products-card">
        <div className="chart-header">
          <h2>Top Products</h2>
          <span>By revenue</span>
        </div>
        {analytics.topProducts && analytics.topProducts.length > 0 ? (
          <table className="top-products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map(product => (
                <tr key={product.productId}>
                  <td>
                    <div className="product-cell">
                      {product.imageUrl && <img src={product.imageUrl} alt={product.productName} />}
                      <span>{product.productName}</span>
                    </div>
                  </td>
                  <td>{product.unitsSold.toLocaleString()}</td>
                  <td>{formatCurrency(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No product sales recorded yet.</p>
        )}
      </div>
    </div>
  )
}
