import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function Deals() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDeals()
  }, [])

  async function loadDeals() {
    try {
      // For now, just load all products as deals
      // In a real app, you'd have a dedicated deals endpoint
      const data = await api.getAllProducts()
      // Simulate deals by showing products with a "discount"
      const dealsProducts = (data || []).slice(0, 12).map(product => ({
        ...product,
        originalPrice: Math.round(product.price * 1.3),
        discount: 30
      }))
      setProducts(dealsProducts)
    } catch (error) {
      console.error('Error loading deals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading deals...</div>
  }

  return (
    <div className="deals-page">
      <div className="deals-header">
        <h1>🔥 Today's Deals</h1>
        <p>Limited time offers on top products</p>
      </div>

      <div className="deals-grid">
        {products.length > 0 ? (
          products.map(product => (
            <Link to={`/products/${product.id}`} key={product.id} className="deal-card">
              <div className="deal-badge">-{product.discount}%</div>
              <div className="deal-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="deal-placeholder">📦</div>
                )}
              </div>
              <div className="deal-info">
                <h3>{product.name}</h3>
                <div className="deal-pricing">
                  <span className="deal-price">KES {product.price?.toLocaleString()}</span>
                  <span className="deal-original">KES {product.originalPrice?.toLocaleString()}</span>
                </div>
                <div className="deal-progress">
                  <div className="deal-progress-bar" style={{ width: `${Math.random() * 60 + 20}%` }}></div>
                  <span className="deal-claimed">Limited stock</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-deals">
            <p>No deals available at the moment. Check back soon!</p>
            <Link to="/" className="btn btn-primary">Continue Shopping</Link>
          </div>
        )}
      </div>
    </div>
  )
}
