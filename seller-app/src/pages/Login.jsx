import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState(null)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = isSignUp
        ? await signUp(email, password, fullName, storeName)
        : await signIn(email, password)

      if (result.error) {
        if (result.blocked) {
          setIsBlocked(true)
        }
        if (result.remainingAttempts !== undefined) {
          setRemainingAttempts(result.remainingAttempts)
        }
        throw result.error
      }

      navigate('/')
    } catch (error) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const switchToUserLogin = () => {
    window.location.href = 'http://localhost:5173/login'
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isSignUp ? 'Register as Seller' : 'Seller Login'}</h2>
        
        {isBlocked && (
          <div className="blocked-warning">
            🚫 Your IP has been temporarily blocked due to too many failed attempts.
          </div>
        )}
        
        {remainingAttempts !== null && remainingAttempts <= 2 && !isBlocked && (
          <div className="attempts-warning">
            ⚠️ Warning: {remainingAttempts} login attempts remaining this hour
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="storeName">Store Name *</label>
                <input
                  id="storeName"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Your store name"
                  required
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isBlocked}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isBlocked}
            />
          </div>
          
          {error && <p className="error">{error}</p>}
          
          <button type="submit" className="btn btn-primary" disabled={loading || isBlocked} style={{ width: '100%' }}>
            {loading ? 'Loading...' : isBlocked ? 'Access Blocked' : isSignUp ? 'Create Seller Account' : 'Login'}
          </button>
        </form>
        
        <p className="toggle-auth">
          {isSignUp ? 'Already have a seller account?' : "Don't have a seller account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Login' : 'Register'}
          </button>
        </p>

        {/* Role Switch - At Bottom for Seller App */}
        <div className="role-switch role-switch-bottom" onClick={switchToUserLogin}>
          <input type="radio" name="role" id="userRole" checked={false} readOnly />
          <label htmlFor="userRole" style={{ cursor: 'pointer' }}>
            Switch to User Login →
          </label>
        </div>
      </div>
    </div>
  )
}
