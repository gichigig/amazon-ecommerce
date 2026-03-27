import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/"> Seller Dashboard</Link>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/products">My Products</Link>
            <Link to="/orders">Orders</Link>
            <span style={{ color: '#a5d6a7' }}>{user.storeName || user.email}</span>
            <button className="btn btn-secondary" onClick={signOut}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  )
}
