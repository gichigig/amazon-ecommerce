import { Link } from 'react-router-dom'

export default function Help() {
  return (
    <div className="help-page">
      <div className="help-container">
        <h1>Bluvberry Customer Service</h1>
        
        <div className="help-search">
          <input 
            type="text" 
            placeholder="Search for help topics..."
            className="help-search-input"
          />
        </div>

        <div className="help-sections">
          <div className="help-section">
            <h2>🛒 Orders & Shopping</h2>
            <ul>
              <li><Link to="#">Track your order</Link></li>
              <li><Link to="#">Cancel an order</Link></li>
              <li><Link to="#">Return or replace items</Link></li>
              <li><Link to="#">View order history</Link></li>
            </ul>
          </div>

          <div className="help-section">
            <h2>💳 Payment & Pricing</h2>
            <ul>
              <li><Link to="#">M-Pesa payment issues</Link></li>
              <li><Link to="#">Price matching</Link></li>
              <li><Link to="#">Promotional codes</Link></li>
              <li><Link to="#">Payment methods</Link></li>
            </ul>
          </div>

          <div className="help-section">
            <h2>👤 Account Settings</h2>
            <ul>
              <li><Link to="/forgot-password">Reset your password</Link></li>
              <li><Link to="#">Update email address</Link></li>
              <li><Link to="#">Manage addresses</Link></li>
              <li><Link to="#">Delete your account</Link></li>
            </ul>
          </div>

          <div className="help-section">
            <h2>🏪 Seller Support</h2>
            <ul>
              <li><Link to="/login?role=seller">Become a seller</Link></li>
              <li><Link to="#">Seller account issues</Link></li>
              <li><Link to="#">Product listing help</Link></li>
              <li><Link to="#">Order fulfillment</Link></li>
            </ul>
          </div>
        </div>

        <div className="help-contact">
          <h2>Still need help?</h2>
          <p>Contact our customer service team:</p>
          <div className="contact-options">
            <a href="mailto:support@bluvberry.com" className="contact-option">
              <span className="contact-icon">📧</span>
              <span>Email Us</span>
            </a>
            <a href="tel:+254700000000" className="contact-option">
              <span className="contact-icon">📞</span>
              <span>Call Us</span>
            </a>
          </div>
        </div>

        <div className="help-back">
          <Link to="/login">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
