import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import HeroCarousel from '../components/HeroCarousel'
import CategoryGrid from '../components/CategoryGrid'
import DealsSection from '../components/DealsSection'
import ProductsRow from '../components/ProductsRow'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'

// Category grid items with images (like amazon-experience-frontend)
const categoryGridItems = {
  gaming: [
    { name: 'Headsets', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=150&h=150&fit=crop' },
    { name: 'Keyboards', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150&h=150&fit=crop' },
    { name: 'Computer mice', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&h=150&fit=crop' },
    { name: 'Chairs', image: 'https://images.unsplash.com/photo-1612550761236-e813928f7271?w=150&h=150&fit=crop' }
  ],
  home: [
    { name: 'Dining', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop' },
    { name: 'Home', image: 'https://images.unsplash.com/photo-1484101403633-571e4eb9a66a?w=150&h=150&fit=crop' },
    { name: 'Kitchen', image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=150&h=150&fit=crop' },
    { name: 'Health and Beauty', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=150&h=150&fit=crop' }
  ],
  fashion: [
    { name: 'Jeans under KES 5,000', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&h=150&fit=crop' },
    { name: 'Tops under KES 2,500', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=150&h=150&fit=crop' },
    { name: 'Dresses under KES 3,000', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&h=150&fit=crop' },
    { name: 'Shoes under KES 5,000', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=150&h=150&fit=crop' }
  ],
  beauty: [
    { name: 'Skincare', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=150&h=150&fit=crop' },
    { name: 'Makeup', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&h=150&fit=crop' },
    { name: 'Hair care', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&h=150&fit=crop' },
    { name: 'Fragrance', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=150&h=150&fit=crop' }
  ]
}

// Sample recommended products
const recommendedProducts = [
  { id: 101, name: 'Echo Dot Smart Speaker with Alexa', image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=200&h=200&fit=crop', price: 2799, originalPrice: 4999, rating: 4.7, reviewCount: 54321, isPrime: true },
  { id: 102, name: 'Fire TV Stick 4K Max Streaming Device', image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=200&h=200&fit=crop', price: 3499, originalPrice: 5499, rating: 4.6, reviewCount: 23456, isPrime: true },
  { id: 103, name: 'Ring Video Doorbell – 1080p HD', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', price: 7499, originalPrice: 9999, rating: 4.5, reviewCount: 18943, isPrime: true },
  { id: 104, name: 'Blink Mini – Indoor Smart Camera', image: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=200&h=200&fit=crop', price: 1999, originalPrice: 3499, rating: 4.4, reviewCount: 45678, isPrime: true },
  { id: 105, name: 'Echo Show 8 Smart Display', image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=200&h=200&fit=crop', price: 8499, originalPrice: 14999, rating: 4.6, reviewCount: 8765, isPrime: true },
  { id: 106, name: 'eero Mesh WiFi Router', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=200&fit=crop', price: 5999, originalPrice: 7999, rating: 4.5, reviewCount: 6543, isPrime: true },
  { id: 107, name: 'Kindle Scribe E-Reader', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=200&fit=crop', price: 27999, originalPrice: 33999, rating: 4.3, reviewCount: 2345, isPrime: true },
  { id: 108, name: 'Fire HD 10 Tablet 10.1" 1080p', image: 'https://images.unsplash.com/photo-1632882765546-1ee75f53becb?w=200&h=200&fit=crop', price: 8999, originalPrice: 14999, rating: 4.5, reviewCount: 34567, isPrime: true }
]

// Sample best sellers
const bestSellers = [
  { id: 201, name: 'Stanley Quencher H2.0 Tumbler', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop', price: 3500, rating: 4.8, reviewCount: 89234, isPrime: true },
  { id: 202, name: 'CeraVe Moisturizing Cream', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop', price: 1608, rating: 4.7, reviewCount: 156789, isPrime: true },
  { id: 203, name: 'Crocs Classic Clogs', image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=200&h=200&fit=crop', price: 3999, originalPrice: 5499, rating: 4.8, reviewCount: 234567, isPrime: true },
  { id: 204, name: 'Liquid I.V. Hydration Multiplier', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop', price: 2398, rating: 4.6, reviewCount: 98765, isPrime: true },
  { id: 205, name: 'COSRX Snail Mucin Essence', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop', price: 1376, originalPrice: 2500, rating: 4.6, reviewCount: 78654, isPrime: true },
  { id: 206, name: 'Apple AirTag 4 Pack', image: 'https://images.unsplash.com/photo-1586253634026-8cb574908d1e?w=200&h=200&fit=crop', price: 7900, originalPrice: 9900, rating: 4.7, reviewCount: 145678, isPrime: true }
]

// Categories for grid
const categories = [
  { title: 'Gaming accessories', items: categoryGridItems.gaming, link: '/?department=electronics' },
  { title: 'Deals in home décor', items: categoryGridItems.home, link: '/?department=home-kitchen' },
  { title: 'Fashion deals', items: categoryGridItems.fashion, link: '/?department=womens-fashion' },
  { title: 'Beauty picks', items: categoryGridItems.beauty, link: '/?department=beauty' }
]

export default function Home() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categoryList, setCategoryList] = useState([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteResults, setAutocompleteResults] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [favourites, setFavourites] = useState(new Set())
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const searchRef = useRef(null)
  const loadMoreRef = useRef(null)
  const isLoadingRef = useRef(false)

  // Initial load
  useEffect(() => {
    fetchCategories()
    fetchProducts(0, true)
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowAutocomplete(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch favourites when user changes
  useEffect(() => {
    if (user) {
      fetchFavourites()
    } else {
      setFavourites(new Set())
    }
  }, [user])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (loading || !initialLoadDone) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loading, hasMore, initialLoadDone])

  useEffect(() => {
    if (initialLoadDone) {
      setPage(0)
      fetchProducts(0, true)
    }
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories()
      setCategoryList(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchFavourites = async () => {
    try {
      const data = await api.getFavourites()
      const favIds = new Set((data || []).map(f => f.productId))
      setFavourites(favIds)
    } catch (error) {
      console.error('Error fetching favourites:', error)
    }
  }

  const fetchProducts = async (pageNum = 0, isInitial = false) => {
    // Prevent concurrent fetches
    if (isLoadingRef.current && !isInitial) return
    
    try {
      isLoadingRef.current = true
      
      if (isInitial) {
        setLoading(true)
        setHasMore(true)
      } else {
        setLoadingMore(true)
      }
      
      const categoryId = selectedCategory !== 'all' ? selectedCategory : null
      const response = await api.getProducts(pageNum, 50, categoryId)
      const newProducts = response?.products || response || []
      
      // Handle different API response formats
      const productsList = Array.isArray(newProducts) ? newProducts : []
      
      if (isInitial) {
        setProducts(productsList)
        setFilteredProducts(productsList)
        setInitialLoadDone(true)
      } else {
        setProducts(prev => [...prev, ...productsList])
        setFilteredProducts(prev => [...prev, ...productsList])
      }
      
      // Check if there are more products
      const moreAvailable = response?.hasMore ?? (productsList.length >= 50)
      setHasMore(moreAvailable && productsList.length > 0)
      setTotalItems(response?.totalItems || productsList.length)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching products:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      isLoadingRef.current = false
    }
  }

  const loadMoreProducts = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return
    fetchProducts(page + 1, false)
  }, [hasMore, page, selectedCategory])

  const toggleFavourite = async (productId) => {
    if (!user) {
      alert('Please sign in to add favourites')
      return
    }

    try {
      if (favourites.has(productId)) {
        await api.removeFromFavourites(productId)
        setFavourites(prev => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
      } else {
        await api.addToFavourites(productId)
        setFavourites(prev => new Set([...prev, productId]))
      }
    } catch (error) {
      console.error('Error toggling favourite:', error)
    }
  }

  const handleAddToCart = (product) => {
    addToCart(product)
  }

  // Filter products based on search
  useEffect(() => {
    let results = [...products]
    if (searchQuery.trim()) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredProducts(results)
  }, [searchQuery, products])

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim().length > 0) {
      const suggestions = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)

      setAutocompleteResults(suggestions)
      setShowAutocomplete(true)
    } else {
      setShowAutocomplete(false)
    }
  }

  const handleAutocompleteClick = (productName) => {
    setSearchQuery(productName)
    setShowAutocomplete(false)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setShowAutocomplete(false)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing deals...</p>
      </div>
    )
  }

  return (
    <div className="home-page amazon-style">
      {/* Hero Carousel with overlapping cards */}
      <div className="hero-section">
        <HeroCarousel />
        
        {/* Category Cards overlapping carousel */}
        <div className="category-overlap">
          <CategoryGrid categories={categories} />
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {/* Second row of category cards */}
        <div className="category-cards-row">
          <div className="single-category-card">
            <h2>Shop for your home essentials</h2>
            <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop" alt="Home essentials" />
            <Link to="/?department=home-kitchen" className="category-link">See more</Link>
          </div>
          <div className="single-category-card">
            <h2>New arrivals in Toys</h2>
            <img src="https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop" alt="Toys" />
            <Link to="/?department=toys-games" className="category-link">See more</Link>
          </div>
          <div className="single-category-card">
            <h2>Explore home bedding</h2>
            <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop" alt="Bedding" />
            <Link to="/?department=home-kitchen" className="category-link">See more</Link>
          </div>
          <div className="single-category-card sign-in-card">
            <h2>Sign in for the best experience</h2>
            {!user ? (
              <>
                <Link to="/login" className="sign-in-btn">Sign in securely</Link>
                <p className="new-customer">New customer? <Link to="/login">Start here</Link></p>
              </>
            ) : (
              <>
                <p className="welcome-back">Welcome back, {user.fullName?.split(' ')[0] || 'User'}!</p>
                <Link to="/orders" className="sign-in-btn">View your orders</Link>
              </>
            )}
          </div>
        </div>

        {/* Deals Section */}
        <DealsSection 
          onToggleFavourite={toggleFavourite}
          favourites={favourites}
          onAddToCart={handleAddToCart}
        />

        {/* Recommended Products Row */}
        <ProductsRow 
          title="Inspired by your browsing history" 
          products={recommendedProducts}
          onToggleFavourite={toggleFavourite}
          favourites={favourites}
          onAddToCart={handleAddToCart}
        />

        {/* Best Sellers Row */}
        <ProductsRow 
          title="Best Sellers in Electronics" 
          products={bestSellers}
          onToggleFavourite={toggleFavourite}
          favourites={favourites}
          onAddToCart={handleAddToCart}
        />

        {/* More Category Cards */}
        <div className="category-cards-row">
          <div className="single-category-card">
            <h2>Refresh your space</h2>
            <img src="https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=300&fit=crop" alt="Refresh space" />
            <Link to="/?department=home-kitchen" className="category-link">See more</Link>
          </div>
          <div className="single-category-card">
            <h2>Shop Pet supplies</h2>
            <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop" alt="Pet supplies" />
            <Link to="/?department=pet-supplies" className="category-link">See more</Link>
          </div>
          <div className="single-category-card">
            <h2>Computers & Accessories</h2>
            <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop" alt="Computers" />
            <Link to="/?department=computers" className="category-link">See more</Link>
          </div>
          <div className="single-category-card">
            <h2>Deals in Outdoor</h2>
            <img src="https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=400&h=300&fit=crop" alt="Outdoor" />
            <Link to="/?department=sports" className="category-link">See more</Link>
          </div>
        </div>

        {/* Products from Database */}
        {filteredProducts.length > 0 && (
          <section className="database-products">
            <h2 className="section-title">Browse All Products</h2>
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  image={product.imageUrl || product.image_url}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  rating={product.averageRating || 4.5}
                  reviewCount={product.totalRatings || Math.floor(Math.random() * 500)}
                  isPrime={true}
                  onToggleFavourite={toggleFavourite}
                  isFavourite={favourites.has(product.id)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Load More Trigger */}
        {initialLoadDone && (
          <div ref={loadMoreRef} className="load-more-trigger">
            {loadingMore && (
              <div className="loading-more">
                <div className="loading-spinner"></div>
                <p>Loading more products...</p>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <p className="no-more-products">You've reached the end!</p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
