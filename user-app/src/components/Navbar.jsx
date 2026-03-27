import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut, isSeller } = useAuth()
  const location = useLocation()
  
  // Check if we're in seller section
  const isSellerSection = location.pathname.startsWith('/seller')

  const handleSignOut = async () => {
    await signOut()
  }

  const userIsSeller = isSeller && isSeller()

  return (
    <nav className={`navbar ${isSellerSection ? 'navbar-seller' : ''}`}>
      <div className="nav-brand">
        <Link to="/">
          {isSellerSection ? '🏪 Seller Dashboard' : 'Bluvberry Sales'}
        </Link>
      </div>
      <div className="nav-links">
        {isSellerSection ? (
          // Seller Navigation
          <>
            <Link to="/seller" className={location.pathname === '/seller' ? 'active' : ''}>
              Dashboard
            </Link>
            <Link to="/seller/products" className={location.pathname === '/seller/products' ? 'active' : ''}>
              My Products
            </Link>
            <Link to="/seller/orders" className={location.pathname === '/seller/orders' ? 'active' : ''}>
              Orders
            </Link>
            <div className="nav-divider"></div>
            <Link to="/" className="btn btn-small btn-switch">
              Switch to Shop
            </Link>
            {user && (
              <>
                <span className="user-email seller-email">{user.storeName || user.email}</span>
                <button onClick={handleSignOut} className="btn btn-small">
                  Sign Out
                </button>
              </>
            )}
          </>
        ) : (
          // User/Shopper Navigation
          <>
            <Link to="/">Home🏠</Link>
            <Link to="/cart">Cart🛒</Link>
            <Link to="/favourites">Favourite❤️</Link>
            {user ? (
              <>
                {userIsSeller && (
                  <Link to="/seller" className="btn btn-small btn-seller">
                    🏪 Seller Dashboard
                  </Link>
                )}
                <span className="user-email">{user.email}</span>
                <button onClick={handleSignOut} className="btn btn-small">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </>
        )}
      </div>
    </nav>
  )
}
