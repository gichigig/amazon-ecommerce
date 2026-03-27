import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../lib/api'

const CartContext = createContext()

const CART_STORAGE_KEY = 'ecommerce_cart'

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setCartItems(parsed)
        setCartCount(parsed.reduce((sum, item) => sum + item.quantity, 0))
      } catch (e) {
        console.error('Error parsing saved cart:', e)
        localStorage.removeItem(CART_STORAGE_KEY)
      }
    }
  }, [])

  // Sync with backend when user logs in
  useEffect(() => {
    if (user) {
      syncCartWithBackend()
    }
  }, [user])

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } else {
      localStorage.removeItem(CART_STORAGE_KEY)
    }
    setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0))
  }, [cartItems])

  // Sync local cart with backend
  const syncCartWithBackend = async () => {
    if (!user) return

    setLoading(true)
    try {
      // First, add any local cart items to backend
      const localCart = localStorage.getItem(CART_STORAGE_KEY)
      if (localCart) {
        const localItems = JSON.parse(localCart)
        for (const item of localItems) {
          try {
            await api.addToCart(item.productId || item.product?.id, item.quantity)
          } catch (e) {
            console.error('Error syncing item to backend:', e)
          }
        }
      }

      // Then fetch the merged cart from backend
      const backendCart = await api.getCartItems()
      if (Array.isArray(backendCart)) {
        setCartItems(backendCart)
        // Clear local storage since backend is source of truth now
        localStorage.removeItem(CART_STORAGE_KEY)
      }
    } catch (error) {
      console.error('Error syncing cart with backend:', error)
    } finally {
      setLoading(false)
    }
  }

  // Refresh cart from backend (for logged in users)
  const refreshCart = async () => {
    if (!user) return

    try {
      const backendCart = await api.getCartItems()
      if (Array.isArray(backendCart)) {
        setCartItems(backendCart)
      }
    } catch (error) {
      console.error('Error refreshing cart:', error)
    }
  }

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    if (user) {
      // If logged in, add to backend and refresh
      try {
        await api.addToCart(product.id, quantity)
        await refreshCart()
        return { success: true, message: 'Added to cart!' }
      } catch (error) {
        console.error('Error adding to cart:', error)
        return { success: false, message: 'Failed to add to cart' }
      }
    } else {
      // If not logged in, add to local cart
      setCartItems(prevItems => {
        const existingIndex = prevItems.findIndex(
          item => (item.productId || item.product?.id) === product.id
        )
        
        if (existingIndex >= 0) {
          // Update quantity of existing item
          const newItems = [...prevItems]
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + quantity
          }
          return newItems
        } else {
          // Add new item
          return [...prevItems, {
            productId: product.id,
            product: product,
            quantity: quantity
          }]
        }
      })
      return { success: true, message: 'Added to cart!' }
    }
  }

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(itemId)
    }

    if (user) {
      try {
        await api.updateCartItem(itemId, quantity)
        await refreshCart()
        return { success: true }
      } catch (error) {
        console.error('Error updating quantity:', error)
        return { success: false }
      }
    } else {
      setCartItems(prevItems => 
        prevItems.map(item => 
          (item.id === itemId || item.productId === itemId) 
            ? { ...item, quantity } 
            : item
        )
      )
      return { success: true }
    }
  }

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    if (user) {
      try {
        await api.removeFromCart(itemId)
        await refreshCart()
        return { success: true }
      } catch (error) {
        console.error('Error removing from cart:', error)
        return { success: false }
      }
    } else {
      setCartItems(prevItems => 
        prevItems.filter(item => 
          item.id !== itemId && item.productId !== itemId
        )
      )
      return { success: true }
    }
  }

  // Clear the entire cart
  const clearCart = async () => {
    if (user) {
      try {
        // Remove each item from backend
        for (const item of cartItems) {
          await api.removeFromCart(item.id)
        }
        setCartItems([])
        return { success: true }
      } catch (error) {
        console.error('Error clearing cart:', error)
        return { success: false }
      }
    } else {
      setCartItems([])
      localStorage.removeItem(CART_STORAGE_KEY)
      return { success: true }
    }
  }

  // Calculate cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartTotal,
    syncCartWithBackend
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
