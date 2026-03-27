import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { api } from '../lib/api'
import { MapPin} from "lucide-react";
// Lazy load the location modal
const LocationModal = lazy(() => import('./LocationModal'))

// Kenyan counties for dropdown
const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
]

// Product categories for search dropdown
const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Sports',
  'Books',
  'Toys',
  'Health',
  'Automotive',
  'Garden'
]

// All 22 Amazon-style departments with images and featured products
const DEPARTMENTS = [
  { 
    id: 'electronics', 
    name: 'Electronics', 
    icon: '📱',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop',
    featured: [
      { name: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop', price: 45000 },
      { name: 'Laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&fit=crop', price: 85000 },
      { name: 'Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop', price: 3500 },
      { name: 'Smart Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop', price: 15000 },
    ]
  },
  { 
    id: 'computers', 
    name: 'Computers', 
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=300&h=300&fit=crop',
    featured: [
      { name: 'Desktop PCs', image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=100&h=100&fit=crop', price: 65000 },
      { name: 'Monitors', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&h=100&fit=crop', price: 25000 },
      { name: 'Keyboards', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&h=100&fit=crop', price: 4500 },
      { name: 'Mouse', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop', price: 2500 },
    ]
  },
  { 
    id: 'smart-home', 
    name: 'Smart Home', 
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=300&h=300&fit=crop',
    featured: [
      { name: 'Smart Speakers', image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=100&h=100&fit=crop', price: 8500 },
      { name: 'Smart Bulbs', image: 'https://images.unsplash.com/photo-1550985543-49bee3167284?w=100&h=100&fit=crop', price: 1500 },
    ]
  },
  { 
    id: 'arts-crafts', 
    name: 'Arts & Crafts', 
    icon: '🎨',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&h=300&fit=crop',
    featured: []
  },
  { 
    id: 'automotive', 
    name: 'Automotive', 
    icon: '🚗',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=300&fit=crop',
    featured: [
      { name: 'Car Electronics', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop', price: 12000 },
      { name: 'Car Accessories', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100&h=100&fit=crop', price: 3500 },
    ]
  },
  { 
    id: 'baby', 
    name: 'Baby', 
    icon: '👶',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=300&fit=crop',
    featured: [
      { name: 'Baby Clothes', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=100&h=100&fit=crop', price: 1200 },
      { name: 'Diapers', image: 'https://images.unsplash.com/photo-1584839404042-8bc21d240e63?w=100&h=100&fit=crop', price: 2500 },
    ]
  },
  { 
    id: 'beauty', 
    name: 'Beauty & Personal Care', 
    icon: '💄',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
    featured: [
      { name: 'Skincare', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=100&h=100&fit=crop', price: 2800 },
      { name: 'Makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=100&h=100&fit=crop', price: 3500 },
      { name: 'Perfumes', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop', price: 5500 },
    ]
  },
  { 
    id: 'womens-fashion', 
    name: "Women's Fashion", 
    icon: '👗',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop',
    featured: [
      { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop', price: 4500 },
      { name: 'Handbags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop', price: 6500 },
      { name: 'Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=100&h=100&fit=crop', price: 5000 },
    ]
  },
  { 
    id: 'mens-fashion', 
    name: "Men's Fashion", 
    icon: '👔',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=300&h=300&fit=crop',
    featured: [
      { name: 'Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop', price: 2500 },
      { name: 'Suits', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=100&h=100&fit=crop', price: 18000 },
      { name: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop', price: 7500 },
    ]
  },
  { 
    id: 'girls-fashion', 
    name: "Girls' Fashion", 
    icon: '👧',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300&h=300&fit=crop',
    featured: []
  },
  { 
    id: 'boys-fashion', 
    name: "Boys' Fashion", 
    icon: '👦',
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=300&h=300&fit=crop',
    featured: []
  },
  { 
    id: 'health', 
    name: 'Health & Household', 
    icon: '💊',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
    featured: [
      { name: 'Vitamins', image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=100&h=100&fit=crop', price: 1800 },
      { name: 'First Aid', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=100&h=100&fit=crop', price: 2200 },
    ]
  },
  { 
    id: 'home-kitchen', 
    name: 'Home & Kitchen', 
    icon: '🍳',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
    featured: [
      { name: 'Cookware', image: 'https://images.unsplash.com/photo-1584990347449-a8f6f0e7b7c0?w=100&h=100&fit=crop', price: 8500 },
      { name: 'Appliances', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=100&h=100&fit=crop', price: 12000 },
      { name: 'Furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop', price: 35000 },
    ]
  },
  { 
    id: 'industrial', 
    name: 'Industrial & Scientific', 
    icon: '🔬',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&h=300&fit=crop',
    featured: []
  },
  { 
    id: 'luggage', 
    name: 'Luggage', 
    icon: '🧳',
    image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=300&h=300&fit=crop',
    featured: [
      { name: 'Travel Bags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop', price: 8500 },
      { name: 'Backpacks', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a45?w=100&h=100&fit=crop', price: 4500 },
    ]
  },
  { 
    id: 'movies-tv', 
    name: 'Movies & Television', 
    icon: '🎬',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=300&fit=crop',
    featured: []
  },
  { 
    id: 'pet-supplies', 
    name: 'Pet Supplies', 
    icon: '🐕',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
    featured: [
      { name: 'Pet Food', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=100&h=100&fit=crop', price: 3500 },
      { name: 'Pet Toys', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=100&h=100&fit=crop', price: 850 },
    ]
  },
  { 
    id: 'software', 
    name: 'Software', 
    icon: '💿',
    image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=300&h=300&fit=crop',
    featured: []
  },
  { 
    id: 'sports', 
    name: 'Sports & Outdoors', 
    icon: '⚽',
    image: 'https://images.unsplash.com/photo-1461896836934- voices-0bfc1-8508-9a26?w=300&h=300&fit=crop',
    featured: [
      { name: 'Fitness Equipment', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop', price: 15000 },
      { name: 'Sportswear', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&h=100&fit=crop', price: 3500 },
    ]
  },
  { 
    id: 'tools', 
    name: 'Tools & Home Improvement', 
    icon: '🔧',
    image: 'https://images.unsplash.com/photo-1581147036324-c17ac41f3930?w=300&h=300&fit=crop',
    featured: [
      { name: 'Power Tools', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop', price: 12000 },
      { name: 'Hand Tools', image: 'https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=100&h=100&fit=crop', price: 3500 },
    ]
  },
  { 
    id: 'toys-games', 
    name: 'Toys & Games', 
    icon: '🎮',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&h=300&fit=crop',
    featured: [
      { name: 'Board Games', image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=100&h=100&fit=crop', price: 2500 },
      { name: 'Action Figures', image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=100&h=100&fit=crop', price: 1800 },
    ]
  },
  { 
    id: 'video-games', 
    name: 'Video Games', 
    icon: '🎯',
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=300&h=300&fit=crop',
    featured: [
      { name: 'Gaming Consoles', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=100&h=100&fit=crop', price: 55000 },
      { name: 'Video Games', image: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=100&h=100&fit=crop', price: 6500 },
    ]
  },
]

// Trending items with images and prices
const TRENDING_ITEMS = [
  { id: 1, name: 'Wireless Earbuds Pro', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop', price: 4999, originalPrice: 7999 },
  { id: 2, name: 'Smart Fitness Band', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=100&h=100&fit=crop', price: 2499, originalPrice: 3999 },
  { id: 3, name: 'Portable Blender', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=100&h=100&fit=crop', price: 1899, originalPrice: 2999 },
  { id: 4, name: 'LED Desk Lamp', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=100&h=100&fit=crop', price: 1499, originalPrice: 2499 },
]

export default function Header() {
  const { user, signOut } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('Nairobi')
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [showAllMenu, setShowAllMenu] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [departmentProducts, setDepartmentProducts] = useState([])
  const [loadingDeptProducts, setLoadingDeptProducts] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategory, setSearchCategory] = useState('All')
  
  const accountRef = useRef(null)
  const allMenuRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountDropdown(false)
      }
      if (allMenuRef.current && !allMenuRef.current.contains(event.target)) {
        setShowAllMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}&category=${searchCategory}`)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setShowAccountDropdown(false)
    navigate('/')
  }

  const handleLocationSelect = (county) => {
    setSelectedLocation(county)
    setShowLocationModal(false)
  }

  // Fetch products when department is selected
  const handleDepartmentClick = async (dept) => {
    setSelectedDepartment(dept)
    setLoadingDeptProducts(true)
    setDepartmentProducts([])
    
    try {
      const products = await api.getProductsByDepartment(dept.id)
      setDepartmentProducts(products || [])
    } catch (error) {
      console.error('Error fetching department products:', error)
      setDepartmentProducts([])
    } finally {
      setLoadingDeptProducts(false)
    }
  }

  return (
    <>
      <header className="main-header">
        {/* Top Header Row */}
        <div className="header-top">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <span className="logo-text">Bluvberry</span>
          </Link>

          {/* Deliver To */}
          <div className="header-deliver" onClick={() => setShowLocationModal(true)}>
            <span className="deliver-icon">📍</span>
            <div className="deliver-text">
              <span className="deliver-label">Deliver to</span>
              <span className="deliver-location">{selectedLocation}</span>
            </div>
          </div>

          {/* Search Bar */}
          <form className="header-search" onSubmit={handleSearch}>
            <select 
              className="search-category"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              className="search-input"
              placeholder="Search Bluvberry"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M21.71 20.29l-4.2-4.2a9 9 0 1 0-1.41 1.41l4.2 4.2a1 1 0 0 0 1.41-1.41zM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/>
              </svg>
            </button>
          </form>

          {/* Account & Lists */}
          <div 
            className="header-account"
            ref={accountRef}
            onMouseEnter={() => setShowAccountDropdown(true)}
            onMouseLeave={() => setShowAccountDropdown(false)}
          >
            <div className="account-text">
              <span className="account-greeting">
                Hello, {user ? user.fullName?.split(' ')[0] || 'User' : 'sign in'}
              </span>
              <span className="account-label">Account & Lists ▾</span>
            </div>

            {showAccountDropdown && (
              <div className="account-dropdown">
                {!user ? (
                  <>
                    <Link to="/login" className="dropdown-signin-btn">Sign in</Link>
                    <p className="dropdown-new-customer">
                      New customer? <Link to="/login">Start here</Link>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="dropdown-user-info">
                      <span>Welcome, {user.fullName || user.email}</span>
                    </div>
                    <div className="dropdown-links">
                      <Link to="/account">Your Account</Link>
                      <Link to="/orders">Your Orders</Link>
                      <Link to="/favourites">Your Wishlist</Link>
                      {(user.seller || user.roles?.includes('ROLE_SELLER')) && (
                        <Link to="/seller">Seller Dashboard</Link>
                      )}
                      <button onClick={handleSignOut} className="dropdown-signout">
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Returns & Orders */}
          <Link to={user ? "/orders" : "/login"} className="header-orders">
            <span className="orders-label">Returns</span>
            <span className="orders-text">& Orders</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="header-cart">
            <div className="cart-icon">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.17 14.75l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4l-3.86 7H8.53L4.27 2H1v2h2l3.6 7.59-1.35 2.44C5.09 14.32 5 14.65 5 15c0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25z"/>
              </svg>
              <span className="cart-count">{cartCount}</span>
            </div>
            <span className="cart-text">Cart</span>
          </Link>
        </div>

        {/* Bottom Header Row - Navigation */}
        <div className="header-bottom">
          <div 
            className="header-all-menu"
            ref={allMenuRef}
            onClick={() => {
              if (!showAllMenu) {
                setShowAllMenu(true)
                setSelectedDepartment(null)
              }
            }}
          >
            <span className="hamburger-icon">☰</span>
            <span>All</span>

            {showAllMenu && (
              <>
                {/* Overlay */}
                <div className="menu-overlay" onClick={() => { setShowAllMenu(false); setSelectedDepartment(null); }}></div>
                
                <div className="all-menu-dropdown amazon-style" onClick={(e) => e.stopPropagation()}>
                  {/* Menu Header */}
                  <div className="all-menu-header">
                    <div className="menu-user-info">
                      <div className="menu-user-avatar">👤</div>
                      <span>Hello, {user ? user.fullName?.split(' ')[0] : 'Sign in'}</span>
                    </div>
                    <button 
                      className="all-menu-close" 
                      onClick={() => { setShowAllMenu(false); setSelectedDepartment(null); }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Menu Content */}
                  <div className="menu-content">
                    {!selectedDepartment ? (
                      <>
                        {/* Trending Now Section */}
                        <div className="menu-section">
                          <h4 className="menu-section-title">🔥 Trending Now</h4>
                          <div className="trending-items">
                            {TRENDING_ITEMS.map(item => (
                              <Link 
                                key={item.id}
                                to={`/?search=${encodeURIComponent(item.name)}`}
                                className="trending-item"
                                onClick={() => setShowAllMenu(false)}
                              >
                                <img src={item.image} alt={item.name} className="trending-img" />
                                <div className="trending-info">
                                  <span className="trending-name">{item.name}</span>
                                  <div className="trending-prices">
                                    <span className="trending-price">KES {item.price.toLocaleString()}</span>
                                    <span className="trending-original">KES {item.originalPrice.toLocaleString()}</span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="menu-divider"></div>

                        {/* Shop By Department */}
                        <div className="menu-section">
                          <h4 className="menu-section-title">Shop By Department</h4>
                          <div className="departments-grid">
                            {DEPARTMENTS.map(dept => (
                              <button 
                                key={dept.id}
                                className="dept-card"
                                onClick={() => handleDepartmentClick(dept)}
                              >
                                <img src={dept.image} alt={dept.name} className="dept-card-img" />
                                <div className="dept-card-overlay">
                                  <span className="dept-card-icon">{dept.icon}</span>
                                  <span className="dept-card-name">{dept.name}</span>
                                </div>
                                <span className="dept-card-arrow">›</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="menu-divider"></div>

                        {/* Programs & Features */}
                        <div className="menu-section">
                          <h4 className="menu-section-title">Programs & Features</h4>
                          <div className="menu-links">
                            <Link to="/deals" onClick={() => setShowAllMenu(false)}>
                              <span className="link-icon">🏷️</span> Today's Deals
                            </Link>
                            <Link to="/login?role=seller" onClick={() => setShowAllMenu(false)}>
                              <span className="link-icon">🏪</span> Sell on Bluvberry
                            </Link>
                            <Link to="/help" onClick={() => setShowAllMenu(false)}>
                              <span className="link-icon">💬</span> Customer Service
                            </Link>
                          </div>
                        </div>

                        <div className="menu-divider"></div>

                        {/* Help & Settings */}
                        <div className="menu-section">
                          <h4 className="menu-section-title">Help & Settings</h4>
                          <div className="menu-links">
                            <Link to="/account" onClick={() => setShowAllMenu(false)}>
                              <span className="link-icon">👤</span> Your Account
                            </Link>
                            <Link to="/orders" onClick={() => setShowAllMenu(false)}>
                              <span className="link-icon">📦</span> Your Orders
                            </Link>
                            <Link to="/favourites" onClick={() => setShowAllMenu(false)}>
                              <span className="link-icon">❤️</span> Your Wishlist
                            </Link>
                            {!user ? (
                              <Link to="/login" onClick={() => setShowAllMenu(false)}>
                                <span className="link-icon">🔑</span> Sign In
                              </Link>
                            ) : (
                              <button onClick={() => { handleSignOut(); setShowAllMenu(false); }}>
                                <span className="link-icon">🚪</span> Sign Out
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Department Submenu */
                      <>
                        <div className="submenu-header">
                          <button 
                            className="back-btn"
                            onClick={() => { setSelectedDepartment(null); setDepartmentProducts([]); }}
                          >
                            ← Main Menu
                          </button>
                        </div>

                        {/* Department Banner */}
                        <div className="dept-banner">
                          <img src={selectedDepartment.image} alt={selectedDepartment.name} className="dept-banner-img" />
                          <div className="dept-banner-overlay">
                            <span className="dept-banner-icon">{selectedDepartment.icon}</span>
                            <h3 className="dept-banner-title">{selectedDepartment.name}</h3>
                          </div>
                        </div>

                        <Link 
                          to={`/?department=${selectedDepartment.id}`}
                          onClick={() => { setShowAllMenu(false); setSelectedDepartment(null); }}
                          className="see-all-btn"
                        >
                          See All {selectedDepartment.name} →
                        </Link>

                        {/* Featured Categories in Department */}
                        {selectedDepartment.featured && selectedDepartment.featured.length > 0 && (
                          <div className="menu-section">
                            <h4 className="menu-section-title">Featured in {selectedDepartment.name}</h4>
                            <div className="featured-grid">
                              {selectedDepartment.featured.map((item, index) => (
                                <Link 
                                  key={index}
                                  to={`/?department=${selectedDepartment.id}&search=${encodeURIComponent(item.name)}`}
                                  className="featured-item"
                                  onClick={() => { setShowAllMenu(false); setSelectedDepartment(null); }}
                                >
                                  <img src={item.image} alt={item.name} className="featured-img" />
                                  <div className="featured-info">
                                    <span className="featured-name">{item.name}</span>
                                    <span className="featured-price">From KES {item.price.toLocaleString()}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="menu-divider"></div>

                        {/* Products from Database */}
                        <div className="menu-section">
                          <h4 className="menu-section-title">Products in {selectedDepartment.name}</h4>
                          <div className="dept-products">
                            {loadingDeptProducts ? (
                              <div className="dept-loading">
                                <div className="loading-spinner"></div>
                                <span>Loading products...</span>
                              </div>
                            ) : departmentProducts.length === 0 ? (
                              <div className="dept-empty">
                                <span className="dept-empty-icon">📦</span>
                                <p>No products yet</p>
                                <small>Check back soon for new arrivals!</small>
                              </div>
                            ) : (
                              <div className="products-scroll">
                                {departmentProducts.slice(0, 8).map(product => (
                                  <Link 
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="menu-product-card"
                                    onClick={() => { setShowAllMenu(false); setSelectedDepartment(null); }}
                                  >
                                    <img 
                                      src={product.imageUrl || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=100&h=100&fit=crop'} 
                                      alt={product.name} 
                                      className="menu-product-img"
                                    />
                                    <div className="menu-product-info">
                                      <span className="menu-product-name">{product.name}</span>
                                      <span className="menu-product-price">KES {product.price?.toLocaleString()}</span>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}
                            {departmentProducts.length > 8 && (
                              <Link 
                                to={`/?department=${selectedDepartment.id}`}
                                className="view-more-link"
                                onClick={() => { setShowAllMenu(false); setSelectedDepartment(null); }}
                              >
                                View all {departmentProducts.length} products →
                              </Link>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <Link to="/deals" className="header-nav-link">Today's Deals</Link>
          <Link to="/help" className="header-nav-link">Customer Service</Link>
          <Link to="/login?role=seller" className="header-nav-link">Sell</Link>
          {user && (user.seller || user.roles?.includes('ROLE_SELLER')) && (
            <Link to="/seller" className="header-nav-link header-nav-seller">Seller Dashboard</Link>
          )}
        </div>
      </header>

      {/* Location Modal */}
      {showLocationModal && (
        <Suspense fallback={<div className="modal-loading">Loading...</div>}>
          <LocationModal
            counties={KENYAN_COUNTIES}
            selectedLocation={selectedLocation}
            onSelect={handleLocationSelect}
            onClose={() => setShowLocationModal(false)}
            isLoggedIn={!!user}
          />
        </Suspense>
      )}
    </>
  )
}
