import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
  }

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard">Admin Panel</Link>
      </div>
      {user && (
        <div className="nav-links">
          <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          <Link to="/products" className={isActive('/products')}>Products</Link>
          <Link to="/orders" className={isActive('/orders')}>Orders</Link>
          <Link to="/users" className={isActive('/users')}>Users</Link>
          <Link to="/analytics" className={isActive('/analytics')}>Analytics</Link>
          <span className="user-email">{user.email}</span>
          <button onClick={handleSignOut} className="btn btn-small">
            Sign Out
          </button>
        </div>
      )}
    </nav>
  )
}
