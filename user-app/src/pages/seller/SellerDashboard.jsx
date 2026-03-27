import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'

export default function SellerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeProducts: 0,
    outOfStock: 0
  })
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      const [statsData, productsData] = await Promise.all([
        api.getSellerStats(),
        api.getMyProducts()
      ])
      
      setStats(statsData)
      setRecentProducts((productsData || []).slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.storeName || user?.fullName || 'Seller'}!</h1>
          <p className="subtitle">Here's what's happening with your store today.</p>
        </div>
        <div className="header-actions">
          <Link to="/seller/products" className="btn btn-primary">+ Add New Product</Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <div className="value">{stats.totalProducts}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Active Products</h3>
            <div className="value">{stats.activeProducts || stats.totalProducts}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <div className="value">{stats.totalOrders}</div>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <div className="value">KES {stats.totalRevenue?.toLocaleString() || 0}</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <div className="value">{stats.pendingOrders}</div>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Out of Stock</h3>
            <div className="value">{stats.outOfStock || 0}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Products</h2>
            <Link to="/seller/products" className="view-all">View All →</Link>
          </div>
          <div className="recent-items-table">
            {recentProducts.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map(product => (
                    <tr key={product.id}>
                      <td className="product-cell">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="product-thumb" />
                        )}
                        <span>{product.name}</span>
                      </td>
                      <td>KES {product.price?.toLocaleString()}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`status-badge ${product.active ? 'status-paid' : 'status-cancelled'}`}>
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No products yet. Start by adding your first product!</p>
                <Link to="/seller/products" className="btn btn-primary">Add Product</Link>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <Link to="/seller/products" className="action-card">
              <span className="action-icon">📦</span>
              <span className="action-label">Manage Products</span>
            </Link>
            <Link to="/seller/orders" className="action-card">
              <span className="action-icon">🛒</span>
              <span className="action-label">View Orders</span>
            </Link>
            <div className="action-card" onClick={() => window.location.reload()}>
              <span className="action-icon">🔄</span>
              <span className="action-label">Refresh Stats</span>
            </div>
          </div>
        </div>
      </div>

      <div className="store-info-card">
        <h3>Store Information</h3>
        <div className="store-details">
          <div className="detail-row">
            <span className="label">Store Name:</span>
            <span className="value">{user?.storeName || 'Not set'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{user?.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Account Type:</span>
            <span className="value">Seller Account</span>
          </div>
        </div>
      </div>
    </div>
  )
}
