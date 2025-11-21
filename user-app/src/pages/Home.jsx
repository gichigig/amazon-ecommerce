import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteResults, setAutocompleteResults] = useState([])
  const searchRef = useRef(null)

  useEffect(() => {
    fetchProducts()
    
    // Close autocomplete when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowAutocomplete(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
      setFilteredProducts(data || [])
      
      // Extract unique categories from product names/descriptions
      const uniqueCategories = [...new Set(
        (data || []).map(p => {
          // Try to extract category from product name (first word)
          const words = p.name.split(' ')
          return words[0]
        })
      )]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on search and category
  useEffect(() => {
    let results = [...products]

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(product => 
        product.name.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(results)
  }, [searchQuery, selectedCategory, products])

  // Handle search input and show autocomplete
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim().length > 0) {
      // Get autocomplete suggestions
      const suggestions = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) // Limit to 5 suggestions

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
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div className="home-page">
      <header className="hero">
        <h1>Welcome to Our Store</h1>
        <p>Discover amazing products at great prices</p>
      </header>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container" ref={searchRef}>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={handleClearSearch}>
                ×
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showAutocomplete && autocompleteResults.length > 0 && (
            <div className="autocomplete-dropdown">
              {autocompleteResults.map((product) => (
                <div
                  key={product.id}
                  className="autocomplete-item"
                  onClick={() => handleAutocompleteClick(product.name)}
                >
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="autocomplete-img" />
                  )}
                  <div className="autocomplete-info">
                    <span className="autocomplete-name">{product.name}</span>
                    <span className="autocomplete-price">KSH {product.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">All Products</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>Showing {filteredProducts.length} of {products.length} products</p>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p className="no-results">
            {searchQuery || selectedCategory !== 'all' 
              ? 'No products found matching your criteria.' 
              : 'No products available at the moment.'}
          </p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              {product.image_url && (
                <img src={product.image_url} alt={product.name} />
              )}
              <h3>{product.name}</h3>
              <p className="description">{product.description}</p>
              <p className="price">KSH {product.price.toLocaleString()}</p>
              <Link to={`/products/${product.id}`} className="btn">
                View Details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
