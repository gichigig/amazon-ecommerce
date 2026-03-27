import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get('role') === 'seller' ? 'seller' : 'user'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [role, setRole] = useState(roleFromUrl) // 'user' or 'seller'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, signIn, signUp, signUpAsSeller, upgradeToSeller } = useAuth()
  const navigate = useNavigate()

  // Update role when URL changes
  useEffect(() => {
    setRole(roleFromUrl)
  }, [roleFromUrl])

  // If user is already a seller, redirect to seller dashboard
  useEffect(() => {
    if (user && role === 'seller' && user.seller) {
      navigate('/seller')
    }
  }, [user, role, navigate])

  // If logged-in user wants to become a seller, show prompt
  useEffect(() => {
    if (user && role === 'seller' && !user.seller) {
      const upgradeSeller = async () => {
        const defaultStoreName = user.fullName ? `${user.fullName}'s Store` : 'My Store'
        const storeName = prompt(`Enter your store name to become a seller:`, defaultStoreName)
        
        if (storeName && storeName.trim()) {
          setLoading(true)
          const result = await upgradeToSeller(storeName.trim())
          setLoading(false)
          
          if (result.error) {
            const msg = (result.error.message || '').toLowerCase()
            if (msg.includes('already a seller')) {
              navigate('/seller')
              return
            }
            alert(result.error.message || 'Failed to upgrade account')
            navigate('/')
            return
          }
          navigate('/seller')
        } else {
          navigate('/')
        }
      }
      
      upgradeSeller()
    }
  }, [user, role, navigate, upgradeToSeller])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let result

      if (isSignUp) {
        if (role === 'seller') {
          if (!storeName.trim()) {
            throw new Error('Store name is required for seller accounts')
          }
          result = await signUpAsSeller(email, password, fullName, storeName)
        } else {
          result = await signUp(email, password, fullName)
        }
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        throw result.error
      }

      // Navigate based on user's actual role from response
      const userData = result.data?.user
      const userIsSeller = userData?.seller || userData?.roles?.includes('ROLE_SELLER')
      
      // Small delay to ensure state update propagates before navigation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (userIsSeller) {
        navigate('/seller')
      } else {
        navigate('/')
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed'
      
      // If user is already a seller, redirect to seller dashboard
      if (errorMessage.toLowerCase().includes('already a seller')) {
        setError('You already have a seller account. Redirecting to seller dashboard...')
        setTimeout(() => {
          navigate('/seller')
        }, 1500)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const isSeller = role === 'seller'

  // Determine header text
  const getHeaderText = () => {
    if (isSignUp) {
      return isSeller ? 'Create your Business Account' : 'Create Account'
    }
    return isSeller ? 'Sign in to your Business Account' : 'Sign in'
  }

  return (
    <div className={`auth-container ${isSeller ? 'auth-seller' : 'auth-customer'}`}>
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <h1>{isSeller ? 'Bluvberry Business' : 'Bluvberry'}</h1>
        </div>

        <h2>{getHeaderText()}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Show name field only for new account signup */}
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="fullName">Your name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First and last name"
              />
            </div>
          )}
          
          {/* Store name for seller accounts */}
          {isSeller && isSignUp && (
            <div className="form-group">
              <label htmlFor="storeName">Business/Store name *</label>
              <input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Your business name"
                required
              />
            </div>
          )}
          
          {/* Email and password fields */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              placeholder={isSignUp ? 'At least 6 characters' : ''}
            />
          </div>

          {!isSignUp && (
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>
          )}
          
          {error && <p className="error">{error}</p>}
          
          <button 
            type="submit" 
            className={`btn ${isSeller ? 'btn-seller-login' : 'btn-customer-login'}`}
            disabled={loading}
          >
            {loading 
              ? 'Loading...' 
              : isSignUp 
                ? (isSeller ? 'Create Business Account' : 'Create your Bluvberry account')
                : 'Sign in'
            }
          </button>
        </form>

        {/* Terms and Privacy */}
        <p className="terms-text">
          By continuing, you agree to Bluvberry's{' '}
          <Link to="/terms-of-use">Conditions of Use</Link> and{' '}
          <Link to="/privacy-notice">Privacy Notice</Link>.
        </p>

        <div className="need-help">
          <Link to="/help">Need help?</Link>
        </div>

        <div className="auth-divider"></div>

        {!isSeller ? (
          <>
            <p className="business-text">Buying for work?</p>
            <Link to="/login?role=seller" className="business-link">
              Create a free business account
            </Link>
          </>
        ) : (
          <Link to="/login" className="business-link">
            ← Back to customer sign in
          </Link>
        )}
        
        <div className="auth-divider"></div>

        <p className="toggle-auth">
          {isSignUp 
            ? 'Already have an account?' 
            : (isSeller ? 'New to Bluvberry Business?' : 'New to Bluvberry?')
          }{' '}
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  )
}
