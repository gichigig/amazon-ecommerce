import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCart: addToCartContext } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [isFavourite, setIsFavourite] = useState(false)
  
  // Ratings state
  const [ratingSummary, setRatingSummary] = useState(null)
  const [myRating, setMyRating] = useState(0)
  const [myReview, setMyReview] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  
  // Questions state
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [submittingQuestion, setSubmittingQuestion] = useState(false)

  useEffect(() => {
    fetchProduct()
    fetchRatings()
    fetchQuestions()
    if (user) {
      checkFavourite()
      fetchMyRating()
    }
  }, [id, user])

  const fetchProduct = async () => {
    try {
      const data = await api.getProduct(id)
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRatings = async () => {
    try {
      const data = await api.getProductRatings(id)
      setRatingSummary(data)
    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }

  const fetchMyRating = async () => {
    try {
      const data = await api.getMyRating(id)
      if (data) {
        setMyRating(data.rating)
        setMyReview(data.review || '')
      }
    } catch (error) {
      console.error('Error fetching my rating:', error)
    }
  }

  const fetchQuestions = async () => {
    try {
      const data = await api.getProductQuestions(id)
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const checkFavourite = async () => {
    try {
      const result = await api.isFavourite(id)
      setIsFavourite(result?.isFavourite || false)
    } catch (error) {
      console.error('Error checking favourite:', error)
    }
  }

  const toggleFavourite = async () => {
    if (!user) {
      setMessage('Please sign in to add to favourites')
      return
    }

    try {
      if (isFavourite) {
        await api.removeFromFavourites(id)
        setIsFavourite(false)
        setMessage('Removed from favourites')
      } else {
        await api.addToFavourites(id)
        setIsFavourite(true)
        setMessage('Added to favourites!')
      }
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error toggling favourite:', error)
      setMessage('Failed to update favourites')
    }
  }

  const addToCart = async () => {
    try {
      const result = await addToCartContext(product, quantity)
      setMessage(result.message)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setMessage('Failed to add to cart')
    }
  }

  const submitRating = async () => {
    if (!user) {
      setMessage('Please sign in to rate this product')
      return
    }
    if (myRating < 1 || myRating > 5) {
      setMessage('Please select a rating between 1 and 5')
      return
    }

    setSubmittingRating(true)
    try {
      await api.addRating(id, myRating, myReview)
      setMessage('Rating submitted successfully!')
      fetchRatings()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error submitting rating:', error)
      setMessage('Failed to submit rating')
    } finally {
      setSubmittingRating(false)
    }
  }

  const submitQuestion = async () => {
    if (!user) {
      setMessage('Please sign in to ask a question')
      return
    }
    if (!newQuestion.trim()) {
      setMessage('Please enter a question')
      return
    }

    setSubmittingQuestion(true)
    try {
      await api.askQuestion(id, newQuestion)
      setNewQuestion('')
      setMessage('Question submitted successfully!')
      fetchQuestions()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error submitting question:', error)
      setMessage('Failed to submit question')
    } finally {
      setSubmittingQuestion(false)
    }
  }

  const renderStars = (rating, interactive = false, onSelect = null) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onSelect && onSelect(star)}
          >
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    )
  }

  if (loading) {
    return <div className="loading-container"><p>Loading...</p></div>
  }

  if (!product) {
    return <div className="error-container"><p>Product not found</p></div>
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail">
        <div className="product-image">
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} />
          )}
        </div>
        <div className="product-info">
          <div className="product-header">
            <h1>{product.name}</h1>
            <button 
              className={`favourite-btn-large ${isFavourite ? 'active' : ''}`}
              onClick={toggleFavourite}
              title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              {isFavourite ? '❤️' : '🤍'}
            </button>
          </div>
          {product.categoryName && (
            <span className="category-badge">{product.categoryName}</span>
          )}
          
          {/* Rating Summary */}
          {ratingSummary && (
            <div className="rating-summary">
              {renderStars(Math.round(ratingSummary.averageRating || 0))}
              <span className="rating-text">
                {ratingSummary.averageRating?.toFixed(1) || '0.0'} ({ratingSummary.totalRatings || 0} reviews)
              </span>
            </div>
          )}
          
          <p className="price">KSH {product.price.toLocaleString()}</p>
          <p className="description">{product.description}</p>
          {product.stock === 0 ? (
            <p className="out-of-stock-label">Out of Stock</p>
          ) : (
            <>
              <p className="stock">
                {product.stock <= 5 ? (
                  <span className="low-stock">Only {product.stock} left in stock - order soon</span>
                ) : (
                  `In Stock (${product.stock} available)`
                )}
              </p>
              
              <div className="add-to-cart">
                <label>
                  Quantity:
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, product.stock))}
                  />
                </label>
                <button onClick={addToCart} className="btn btn-primary">
                  Add to Cart
                </button>
              </div>
            </>
          )}
          
          {message && <p className="message">{message}</p>}
        </div>
      </div>

      {/* Rate This Product Section */}
      <div className="rate-product-section">
        <h2>Rate This Product</h2>
        {user ? (
          <div className="rating-form">
            <div className="rating-input">
              <label>Your Rating:</label>
              {renderStars(myRating, true, setMyRating)}
            </div>
            <div className="review-input">
              <label>Your Review (optional):</label>
              <textarea
                value={myReview}
                onChange={(e) => setMyReview(e.target.value)}
                placeholder="Write your review here..."
                rows={3}
              />
            </div>
            <button 
              onClick={submitRating} 
              disabled={submittingRating}
              className="btn btn-primary"
            >
              {submittingRating ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        ) : (
          <p className="login-prompt">Please sign in to rate this product</p>
        )}
      </div>

      {/* Customer Reviews Section */}
      {ratingSummary && ratingSummary.ratings && ratingSummary.ratings.length > 0 && (
        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-list">
            {ratingSummary.ratings.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <span className="reviewer-name">{review.userName}</span>
                  {renderStars(review.rating)}
                </div>
                {review.review && <p className="review-text">{review.review}</p>}
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ask a Question Section */}
      <div className="questions-section">
        <h2>Questions & Answers</h2>
        
        {user ? (
          <div className="question-form">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question about this product..."
              rows={2}
            />
            <button 
              onClick={submitQuestion} 
              disabled={submittingQuestion}
              className="btn btn-secondary"
            >
              {submittingQuestion ? 'Submitting...' : 'Ask Question'}
            </button>
          </div>
        ) : (
          <p className="login-prompt">Please sign in to ask a question</p>
        )}

        {questions.length > 0 && (
          <div className="questions-list">
            {questions.map((q) => (
              <div key={q.id} className="question-card">
                <div className="question">
                  <span className="q-label">Q:</span>
                  <span className="q-text">{q.question}</span>
                  <span className="q-author">- {q.userName}</span>
                </div>
                {q.answer ? (
                  <div className="answer">
                    <span className="a-label">A:</span>
                    <span className="a-text">{q.answer}</span>
                    <span className="a-author">- {q.answeredByName}</span>
                  </div>
                ) : (
                  <div className="no-answer">Awaiting seller response</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
