import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Analytics() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch total orders and revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount')

      if (ordersError) throw ordersError

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const totalOrders = orders?.length || 0

      // Fetch total products
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      if (productsError) throw productsError

      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (usersError) throw usersError

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-container"><p>Loading analytics...</p></div>
  }

  return (
    <div className="analytics-page">
      <h1>Analytics Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">KSH {stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>

        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>

        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
      </div>

      <div className="chart-placeholder">
        <p>📊 Charts and detailed analytics coming soon...</p>
      </div>
    </div>
  )
}
