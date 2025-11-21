import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (!isAdmin) {
    return (
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>You do not have admin privileges.</p>
      </div>
    )
  }

  return children
}
