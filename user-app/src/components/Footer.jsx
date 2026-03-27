import { Link } from 'react-router-dom'

const footerSections = [
  {
    title: 'Get to Know Us',
    links: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press Releases', path: '/press' },
      { name: 'Our Blog', path: '/blog' }
    ]
  },
  {
    title: 'Make Money with Us',
    links: [
      { name: 'Sell on Our Platform', path: '/sell' },
      { name: 'Become an Affiliate', path: '/affiliate' },
      { name: 'Advertise Your Products', path: '/advertise' },
      { name: 'Seller Dashboard', path: '/seller' }
    ]
  },
  {
    title: 'Payment Products',
    links: [
      { name: 'M-Pesa Payments', path: '/mpesa' },
      { name: 'Shop with Points', path: '/points' },
      { name: 'Gift Cards', path: '/gift-cards' },
      { name: 'Payment Methods', path: '/payment-methods' }
    ]
  },
  {
    title: 'Let Us Help You',
    links: [
      { name: 'Your Account', path: '/account' },
      { name: 'Your Orders', path: '/orders' },
      { name: 'Shipping Rates & Policies', path: '/shipping' },
      { name: 'Returns & Refunds', path: '/returns' },
      { name: 'Help Center', path: '/help' }
    ]
  }
]

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="site-footer">
      {/* Back to top */}
      <button onClick={scrollToTop} className="footer-back-to-top">
        Back to top
      </button>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-sections">
            {footerSections.map((section) => (
              <div key={section.title} className="footer-section">
                <h3 className="footer-section-title">{section.title}</h3>
                <ul className="footer-links">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="footer-link">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="footer-divider">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="footer-logo-text">ShopKenya</span>
                <span className="footer-logo-domain">.co.ke</span>
              </Link>
              <div className="footer-locale">
                <span className="footer-locale-item">🌐 English</span>
                <span className="footer-locale-item">KES - Kenyan Shilling</span>
                <span className="footer-locale-item">🇰🇪 Kenya</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-legal-links">
            <a href="/terms" className="footer-legal-link">Conditions of Use</a>
            <a href="/privacy" className="footer-legal-link">Privacy Notice</a>
            <a href="/cookies" className="footer-legal-link">Cookie Policy</a>
            <a href="/ads-privacy" className="footer-legal-link">Your Ads Privacy Choices</a>
          </div>
          <p className="footer-copyright">
            © {new Date().getFullYear()}, ShopKenya.co.ke, Inc. or its affiliates
          </p>
        </div>
      </div>
    </footer>
  )
}
