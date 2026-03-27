// API client for Spring Boot backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('accessToken')
    this.refreshToken = localStorage.getItem('refreshToken')
    this.isRefreshing = false
    this.refreshSubscribers = []
  }

  setTokens(accessToken, refreshToken = null) {
    this.token = accessToken
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
    } else {
      localStorage.removeItem('accessToken')
    }
    
    if (refreshToken !== null) {
      this.refreshToken = refreshToken
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      } else {
        localStorage.removeItem('refreshToken')
      }
    }
  }

  getToken() {
    return this.token || localStorage.getItem('accessToken')
  }

  getRefreshToken() {
    return this.refreshToken || localStorage.getItem('refreshToken')
  }

  onRefreshed(token) {
    this.refreshSubscribers.forEach(callback => callback(token))
    this.refreshSubscribers = []
  }

  addRefreshSubscriber(callback) {
    this.refreshSubscribers.push(callback)
  }

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      this.setTokens(null, null)
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    this.setTokens(data.accessToken, data.refreshToken)
    return data.accessToken
  }

  async request(endpoint, options = {}, retry = true) {
    const url = `${API_BASE_URL}${endpoint}`
    const token = this.getToken()

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && retry && this.getRefreshToken()) {
      if (!this.isRefreshing) {
        this.isRefreshing = true
        try {
          const newToken = await this.refreshAccessToken()
          this.isRefreshing = false
          this.onRefreshed(newToken)
          return this.request(endpoint, options, false)
        } catch (error) {
          this.isRefreshing = false
          this.setTokens(null, null)
          throw new Error('Session expired. Please sign in again.')
        }
      } else {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          this.addRefreshSubscriber((token) => {
            headers['Authorization'] = `Bearer ${token}`
            fetch(url, { ...options, headers })
              .then(res => res.json())
              .then(resolve)
              .catch(reject)
          })
        })
      }
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(payload.error || payload.message || `HTTP error! status: ${response.status}`)
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  // Auth endpoints
  async signUp(email, password, fullName = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { 
          data: null, 
          error: { message: data.error || 'Sign up failed' },
          blocked: data.blocked || false,
          remainingAttempts: data.remainingAttempts
        }
      }
      
      this.setTokens(data.accessToken, data.refreshToken)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  }

  async signIn(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { 
          data: null, 
          error: { message: data.error || 'Sign in failed' },
          blocked: data.blocked || false,
          remainingAttempts: data.remainingAttempts
        }
      }
      
      this.setTokens(data.accessToken, data.refreshToken)
      return { data, error: null, remainingAttempts: data.remainingAttempts }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  }

  async signOut() {
    try {
      const refreshToken = this.getRefreshToken()
      if (refreshToken) {
        await this.request('/auth/signout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        })
      }
    } catch (error) {
      // Ignore errors during signout
    }
    this.setTokens(null, null)
    return { error: null }
  }

  async getCurrentUser() {
    try {
      const data = await this.request('/auth/me')
      // Backend returns a refreshed accessToken; keep the client in sync.
      if (data?.accessToken) {
        this.setTokens(data.accessToken)
      }
      return { data, error: null }
    } catch (error) {
      this.setTokens(null, null)
      return { data: null, error }
    }
  }

  // Categories endpoints
  async getCategories() {
    return this.request('/categories')
  }

  async getCategory(id) {
    return this.request(`/categories/${id}`)
  }

  // Products endpoints
  async getProducts(page = 0, size = 50, categoryId = null, department = null) {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
    if (categoryId) params.append('categoryId', categoryId)
    if (department) params.append('department', department)
    return this.request(`/products?${params}`)
  }

  async getProductsByDepartment(department) {
    return this.request(`/products/department/${department}`)
  }

  async getAllProducts() {
    return this.request('/products/all')
  }

  async getProduct(id) {
    return this.request(`/products/${id}`)
  }

  async searchProducts(query, page = 0, size = 50, categoryId = null) {
    const params = new URLSearchParams({ 
      q: query, 
      page: page.toString(), 
      size: size.toString() 
    })
    if (categoryId) params.append('categoryId', categoryId)
    return this.request(`/products/search?${params}`)
  }

  async createProduct(product) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  async updateProduct(id, product) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadProductImage(file) {
    const formData = new FormData()
    formData.append('file', file)

    const token = this.getToken()
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    return response.json()
  }

  // Cart endpoints
  async getCartItems() {
    return this.request('/cart')
  }

  async addToCart(productId, quantity = 1) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    })
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    })
  }

  async removeFromCart(itemId) {
    return this.request(`/cart/${itemId}`, {
      method: 'DELETE',
    })
  }

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    })
  }

  // Orders endpoints
  async getOrders() {
    return this.request('/orders')
  }

  async getAllOrders() {
    return this.request('/orders/all')
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`)
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // M-Pesa endpoints
  async initiateSTKPush(phone, amount, orderId, accountReference = 'E-Commerce Store') {
    return this.request('/mpesa/stk-push', {
      method: 'POST',
      body: JSON.stringify({ phone, amount, orderId, accountReference }),
    })
  }

  async getPaymentStatus(orderId) {
    return this.request(`/orders/${orderId}/payment-status`)
  }

  // Ratings endpoints
  async getProductRatings(productId) {
    return this.request(`/ratings/product/${productId}`)
  }

  async addRating(productId, rating, review = '') {
    return this.request(`/ratings/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    })
  }

  async getMyRating(productId) {
    return this.request(`/ratings/product/${productId}/my-rating`)
  }

  async deleteRating(productId) {
    return this.request(`/ratings/product/${productId}`, {
      method: 'DELETE',
    })
  }

  // Product Questions endpoints
  async getProductQuestions(productId) {
    return this.request(`/questions/product/${productId}`)
  }

  async askQuestion(productId, question) {
    return this.request(`/questions/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    })
  }

  async answerQuestion(questionId, answer) {
    return this.request(`/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    })
  }

  // Favourites endpoints
  async getFavourites() {
    return this.request('/favourites')
  }

  async addToFavourites(productId) {
    return this.request('/favourites', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
  }

  async removeFromFavourites(productId) {
    return this.request(`/favourites/${productId}`, {
      method: 'DELETE',
    })
  }

  async isFavourite(productId) {
    return this.request(`/favourites/check/${productId}`)
  }

  // ==================== SELLER ENDPOINTS ====================
  
  // Seller Products endpoints
  async getMyProducts() {
    return this.request('/seller/products')
  }

  async createSellerProduct(product) {
    return this.request('/seller/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  async updateSellerProduct(id, product) {
    return this.request(`/seller/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    })
  }

  async deleteSellerProduct(id) {
    return this.request(`/seller/products/${id}`, {
      method: 'DELETE',
    })
  }

  // Seller Orders
  async getSellerOrders() {
    return this.request('/seller/orders')
  }

  async updateSellerOrderStatus(id, status) {
    return this.request(`/seller/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // Seller Stats
  async getSellerStats() {
    return this.request('/seller/stats')
  }

  // Seller SignUp (registers as seller)
  async signUpAsSeller(email, password, fullName, storeName) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, seller: true, storeName }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { 
          data: null, 
          error: { message: data.error || 'Sign up failed' },
          blocked: data.blocked || false,
          remainingAttempts: data.remainingAttempts
        }
      }
      
      this.setTokens(data.accessToken, data.refreshToken)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  }

  // Upgrade existing user to seller
  async upgradeToSeller(storeName) {
    try {
      const data = await this.request('/auth/upgrade-to-seller', {
        method: 'POST',
        body: JSON.stringify({ storeName }),
      })
      
      if (data.accessToken) {
        this.setTokens(data.accessToken, data.refreshToken)
      }
      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  }
}

const api = new ApiClient()
export default api
export { api }
