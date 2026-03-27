import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // TODO: Implement actual password reset API call
      // await api.requestPasswordReset(email)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="auth-container auth-customer">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>Bluvberry</h1>
          </div>
          
          <h2>Check your email</h2>
          
          <div className="success-message">
            <p>
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p>
              If you don't receive an email within a few minutes, check your spam folder.
            </p>
          </div>

          <Link to="/login" className="btn btn-customer-login" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem' }}>
            Return to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container auth-customer">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Bluvberry</h1>
        </div>

        <h2>Password assistance</h2>
        
        <p className="auth-subtitle">
          Enter the email address associated with your Bluvberry account.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button 
            type="submit" 
            className="btn btn-customer-login"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Continue'}
          </button>
        </form>

        <div className="auth-divider"></div>

        <Link to="/login" className="back-link">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  )
}
