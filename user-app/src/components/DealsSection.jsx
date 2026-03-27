import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'

const defaultDeals = [
  {
    id: 1,
    title: 'Wireless Bluetooth Earbuds Pro',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop',
    price: 4999,
    originalPrice: 8999,
    rating: 4.5,
    reviewCount: 12847,
    isPrime: true,
    dealBadge: 'Limited time deal'
  },
  {
    id: 2,
    title: 'Samsung Galaxy Tab S9 Ultra 14.6" 256GB',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
    price: 89999,
    originalPrice: 119999,
    rating: 4.7,
    reviewCount: 8432,
    isPrime: true,
    dealBadge: 'Deal of the Day'
  },
  {
    id: 3,
    title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=300&fit=crop',
    price: 27800,
    originalPrice: 39999,
    rating: 4.6,
    reviewCount: 45621,
    isPrime: true,
    dealBadge: 'Lightning Deal'
  },
  {
    id: 4,
    title: 'Instant Pot Duo Plus 9-in-1 Electric Pressure Cooker',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&h=300&fit=crop',
    price: 7995,
    originalPrice: 12995,
    rating: 4.8,
    reviewCount: 234567,
    isPrime: true,
    dealBadge: 'Best Seller'
  },
  {
    id: 5,
    title: 'Kindle Paperwhite (16 GB) – 6.8" Display',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop',
    price: 11999,
    originalPrice: 14999,
    rating: 4.7,
    reviewCount: 89234,
    isPrime: true
  },
  {
    id: 6,
    title: 'Apple Watch Series 9 GPS 45mm Smartwatch',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop',
    price: 34900,
    originalPrice: 42900,
    rating: 4.5,
    reviewCount: 12543,
    isPrime: true
  }
]

export default function DealsSection({ 
  deals = defaultDeals, 
  title = "Today's Deals",
  onAddToCart,
  onToggleFavourite,
  favourites = new Set()
}) {
  return (
    <section className="deals-section">
      <div className="deals-header">
        <h2 className="deals-title">{title}</h2>
        <Link to="/deals" className="deals-see-all">
          See all deals
        </Link>
      </div>
      <div className="deals-grid">
        {deals.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title || product.name}
            image={product.image || product.imageUrl}
            price={product.price}
            originalPrice={product.originalPrice}
            rating={product.rating}
            reviewCount={product.reviewCount}
            isPrime={product.isPrime}
            dealBadge={product.dealBadge}
            onAddToCart={onAddToCart}
            onToggleFavourite={onToggleFavourite}
            isFavourite={favourites.has(product.id)}
          />
        ))}
      </div>
    </section>
  )
}
