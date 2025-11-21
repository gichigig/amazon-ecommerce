import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!user) {
      setMessage('Please sign in to add items to cart')
      return
    }

    try {
      const { error } = await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        quantity: quantity,
      })

      if (error) throw error
      setMessage('Added to cart successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setMessage('Failed to add to cart')
    }
  }

  if (loading) {
    return <div className="loading-container"><p>Loading...</p></div>
  }

  if (!product) {
    return <div className="error-container"><p>Product not found</p></div>
  }

  return (
    <div className="product-detail">
      <div className="product-image">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} />
        )}
      </div>
      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">KSH {product.price.toLocaleString()}</p>
        <p className="description">{product.description}</p>
        <p className="stock">Stock: {product.stock}</p>
        
        <div className="add-to-cart">
          <label>
            Quantity:
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </label>
          <button onClick={addToCart} className="btn btn-primary">
            Add to Cart
          </button>
        </div>
        
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  )
}
