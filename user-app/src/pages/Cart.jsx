import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import MpesaCheckout from '../components/MpesaCheckout'

export default function Cart() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCartItems()
    }
  }, [user])

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error
      setCartItems(data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId)

      if (error) throw error
      fetchCartItems()
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const removeItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      fetchCartItems()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  )

  if (!user) {
    return (
      <div className="cart-page">
        <h2>Shopping Cart</h2>
        <p>Please sign in to view your cart</p>
      </div>
    )
  }

  if (loading) {
    return <div className="loading-container"><p>Loading cart...</p></div>
  }

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                {item.products.image_url && (
                  <img src={item.products.image_url} alt={item.products.name} />
                )}
                <div className="item-details">
                  <h3>{item.products.name}</h3>
                  <p className="price">KSH {item.products.price.toLocaleString()}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <p className="subtotal">
                    Subtotal: KSH {(item.products.price * item.quantity).toLocaleString()}
                  </p>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Total: KSH {total.toLocaleString()}</h3>
            <MpesaCheckout 
              cartItems={cartItems} 
              total={total}
              onSuccess={() => {
                alert('Payment successful! Thank you for your order.')
                navigate('/')
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
