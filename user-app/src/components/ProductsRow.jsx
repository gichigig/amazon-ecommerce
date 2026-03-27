import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

export default function ProductsRow({ 
  title, 
  products = [], 
  onAddToCart,
  onToggleFavourite,
  favourites = new Set(),
  linkTo
}) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="products-row">
      <div className="products-row-header">
        <h2 className="products-row-title">{title}</h2>
        {linkTo && (
          <a href={linkTo} className="products-row-link">
            See all
          </a>
        )}
      </div>
      
      <div className="products-row-container">
        <button
          onClick={() => scroll('left')}
          className="products-row-nav products-row-nav-left"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div
          ref={scrollRef}
          className="products-row-scroll"
        >
          {products.map((product) => (
            <div key={product.id} className="products-row-item">
              <ProductCard
                id={product.id}
                title={product.name || product.title}
                image={product.imageUrl || product.image}
                price={product.price}
                originalPrice={product.originalPrice}
                rating={product.rating || 4.5}
                reviewCount={product.reviewCount || Math.floor(Math.random() * 1000)}
                isPrime={product.isPrime}
                dealBadge={product.dealBadge}
                onAddToCart={onAddToCart}
                onToggleFavourite={onToggleFavourite}
                isFavourite={favourites.has(product.id)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="products-row-nav products-row-nav-right"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  )
}
