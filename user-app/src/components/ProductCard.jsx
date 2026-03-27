import { Link } from 'react-router-dom'
import { Star, StarHalf, Heart } from 'lucide-react'

export default function ProductCard({
  id,
  title,
  image,
  price,
  originalPrice,
  rating = 4.5,
  reviewCount = 0,
  isPrime = false,
  dealBadge,
  onAddToCart,
  onToggleFavourite,
  isFavourite = false
}) {
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={14} className="star-icon filled" />
      )
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" size={14} className="star-icon filled" />
      )
    }
    // Add empty stars to make 5 total
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={14} className="star-icon empty" />
      )
    }
    return stars
  }

  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-KE').format(Math.floor(amount))
  }

  return (
    <div className="product-card">
      {/* Deal Badge */}
      {dealBadge && (
        <span className="product-deal-badge">{dealBadge}</span>
      )}

      {/* Favourite Button */}
      {onToggleFavourite && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleFavourite(id)
          }}
          className={`product-favourite-btn ${isFavourite ? 'active' : ''}`}
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Heart size={20} fill={isFavourite ? '#e74c3c' : 'none'} />
        </button>
      )}

      {/* Product Image */}
      <Link to={`/product/${id}`} className="product-image-link">
        <div className="product-image-container">
          <img
            src={image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'}
            alt={title}
            className="product-image"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="product-info">
        {/* Product Title */}
        <Link to={`/product/${id}`} className="product-title-link">
          <h3 className="product-title">{title}</h3>
        </Link>

        {/* Rating */}
        <div className="product-rating">
          <div className="product-stars">{renderStars(rating)}</div>
          <span className="product-review-count">
            {reviewCount.toLocaleString()}
          </span>
        </div>

        {/* Price */}
        <div className="product-price-container">
          {discountPercentage > 0 && (
            <span className="product-discount">-{discountPercentage}%</span>
          )}
          <span className="product-price">
            <span className="product-currency">KES</span>
            <span className="product-amount">{formatPrice(price)}</span>
          </span>
        </div>
        
        {originalPrice && originalPrice > price && (
          <span className="product-original-price">
            KES {formatPrice(originalPrice)}
          </span>
        )}

        {/* Prime Badge */}
        {isPrime && (
          <div className="product-prime">
            <span className="prime-badge">prime</span>
            <span className="prime-delivery">FREE Delivery</span>
          </div>
        )}

        {/* Add to Cart Button */}
        {onAddToCart && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart(id)
            }}
            className="product-add-to-cart"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  )
}
