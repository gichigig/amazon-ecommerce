import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

// Lazy load user pages
const Home = lazy(() => import('./pages/Home'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Login = lazy(() => import('./pages/Login'))
const Cart = lazy(() => import('./pages/Cart'))
const Favourite = lazy(() => import('./pages/Favourite'))
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'))
const PrivacyNotice = lazy(() => import('./pages/PrivacyNotice'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Help = lazy(() => import('./pages/Help'))
const Deals = lazy(() => import('./pages/Deals'))

// Lazy load seller pages
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'))
const SellerProducts = lazy(() => import('./pages/seller/SellerProducts'))
const SellerOrders = lazy(() => import('./pages/seller/SellerOrders'))

// Loading fallback component
const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-spinner"></div>
    <p>Loading...</p>
  </div>
)

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                {/* User/Shopper Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/favourites" element={<Favourite />} />
                <Route path="/deals" element={<Deals />} />
                
                {/* Legal & Help Pages */}
                <Route path="/terms-of-use" element={<TermsOfUse />} />
                <Route path="/privacy-notice" element={<PrivacyNotice />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/help" element={<Help />} />
                
                {/* Seller Routes - Protected */}
                <Route path="/seller" element={
                  <ProtectedRoute requireSeller={true}>
                    <SellerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/seller/products" element={
                  <ProtectedRoute requireSeller={true}>
                    <SellerProducts />
                  </ProtectedRoute>
                } />
                <Route path="/seller/orders" element={
                  <ProtectedRoute requireSeller={true}>
                    <SellerOrders />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </main>
        </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
