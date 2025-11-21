import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel. Select an option below:</p>
      
      <div className="dashboard-grid">
        <Link to="/products" className="dashboard-card">
          <h3>📦 Products</h3>
          <p>Manage product inventory</p>
        </Link>
        
        <Link to="/orders" className="dashboard-card">
          <h3>🛒 Orders</h3>
          <p>View and manage orders</p>
        </Link>
        
        <Link to="/users" className="dashboard-card">
          <h3>👥 Users</h3>
          <p>Manage user accounts</p>
        </Link>
        
        <Link to="/analytics" className="dashboard-card">
          <h3>📊 Analytics</h3>
          <p>View sales analytics</p>
        </Link>
      </div>
    </div>
  )
}
