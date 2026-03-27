import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, requireSeller = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // If seller route is required, check if user is a seller
  if (requireSeller) {
    const isSeller = user?.seller || user?.roles?.includes('ROLE_SELLER')
    if (!isSeller) {
      return <Navigate to="/" />
    }
  }

  return children
}
