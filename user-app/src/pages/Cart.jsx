import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import MpesaCheckout from '../components/MpesaCheckout'

export default function Cart() {
  const { user } = useAuth()
  const { cartItems, loading, updateQuantity: updateCartQuantity, removeFromCart, getCartTotal, refreshCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      refreshCart()
    }
  }, [user])

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    await updateCartQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId)
  }

  const total = getCartTotal()

  if (loading) {
    return <div className="loading-container"><p>Loading cart...</p></div>
  }

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => {
              const product = item.product || item
              const price = product.price || 0
              const imageUrl = product.imageUrl || product.image_url
              const name = product.name || 'Unknown Product'
              const itemId = item.id || item.productId
              const stock = product.stock ?? 999
              const isOutOfStock = stock === 0
              const canIncrease = item.quantity < stock
              
              return (
                <div key={itemId} className="cart-item">
                  {imageUrl && (
                    <img src={imageUrl} alt={name} />
                  )}
                  <div className="item-details">
                    <h3>{name}</h3>
                    {isOutOfStock ? (
                      <span className="out-of-stock-badge">Out of Stock</span>
                    ) : (
                      <>
                        <p className="price">KSH {price.toLocaleString()}</p>
                        <div className="quantity-controls">
                          <button
                            onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                            disabled={!canIncrease}
                          >
                            +
                          </button>
                        </div>
                        {stock <= 5 && stock > 0 && (
                          <p className="stock-warning">Only {stock} left in stock</p>
                        )}
                        {!canIncrease && item.quantity >= stock && (
                          <p className="stock-warning">Maximum quantity reached</p>
                        )}
                        <p className="subtotal">
                          Subtotal: KSH {(price * item.quantity).toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveItem(itemId)}
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
          <div className="cart-summary">
            <h3>Total: KSH {total.toLocaleString()}</h3>
            {user ? (
              <MpesaCheckout 
                cartItems={cartItems} 
                total={total}
                onSuccess={() => {
                  alert('Payment successful! Thank you for your order.')
                  navigate('/')
                }}
              />
            ) : (
              <div className="login-prompt">
                <p>Please sign in to checkout</p>
                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                  Sign In
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
