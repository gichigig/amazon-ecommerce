import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Bluvberry Sales</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home🏠</Link>
        <Link to="/cart">Cart🛒</Link>
        <Link to="/favourite">Favourite❤️</Link>
        <Link to="/category">Category</Link>
        {user ? (
          <>
            <span className="user-email">{user.email}</span>
            <button onClick={handleSignOut} className="btn btn-small">
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  )
}
