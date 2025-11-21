import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function MpesaCheckout({ cartItems, total, onSuccess }) {
  const { user } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showModal, setShowModal] = useState(false)
  const processingRef = useRef(false) // Track if payment is being processed

  const initiatePayment = async (e) => {
    e.preventDefault()
    
    // Prevent double submission using ref (survives re-renders)
    if (processingRef.current || loading) {
      console.log('Payment already in progress, ignoring duplicate submission')
      return
    }

    processingRef.current = true
    setLoading(true)
    setMessage('')

    // Validate phone number format (Kenyan format: 254XXXXXXXXX or 07XXXXXXXX)
    let formattedPhone = phoneNumber.replace(/\s/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    }
    if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
      setMessage('Please enter a valid Kenyan phone number (e.g., 0712345678)')
      setLoading(false)
      return
    }

    console.log('Initiating M-Pesa payment for:', formattedPhone, 'Amount:', total)

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending_payment',
          payment_method: 'mpesa',
          mpesa_phone: formattedPhone,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Get user session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Please login to continue')
      }

      // Call M-Pesa Edge Function
      setMessage(`Initiating M-Pesa payment...`)
      
      console.log('Calling STK Push Edge Function for order:', order.id)
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mpesa-stk-push`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: formattedPhone,
            amount: total,
            orderId: order.id,
            accountReference: 'E-Commerce Store',
          }),
        }
      )

      const result = await response.json()
      console.log('STK Push response:', result)

      if (!result.success) {
        throw new Error(result.error || 'Failed to initiate M-Pesa payment')
      }

      setMessage(`STK Push sent to ${formattedPhone}. Please enter your M-Pesa PIN on your phone.`)

      // Poll for payment confirmation
      checkPaymentStatus(order.id)

    } catch (error) {
      console.error('Error processing payment:', error)
      setMessage(error.message || 'Payment failed. Please try again.')
      setLoading(false)
      processingRef.current = false // Reset on error
    }
  }

  const checkPaymentStatus = async (orderId) => {
    const maxAttempts = 60 // Check for 60 seconds
    let attempts = 0

    const interval = setInterval(async () => {
      attempts++

      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select('status, mpesa_receipt_number')
          .eq('id', orderId)
          .single()

        if (error) throw error

        if (order.status === 'paid') {
          clearInterval(interval)
          setMessage(`Payment successful! Receipt: ${order.mpesa_receipt_number}`)
          
          // Clear cart
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)

          setLoading(false)
          processingRef.current = false

          // Call success callback after 2 seconds
          if (onSuccess) {
            setTimeout(() => onSuccess(), 2000)
          }
        } else if (order.status === 'cancelled' || attempts >= maxAttempts) {
          clearInterval(interval)
          setMessage('Payment timeout or cancelled. Please try again.')
          setLoading(false)
          processingRef.current = false
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        clearInterval(interval)
        setMessage('Error checking payment status')
        setLoading(false)
        processingRef.current = false
      }
    }, 1000) // Check every second
  }

  return (
    <>
      <button
        className="btn btn-primary btn-mpesa"
        onClick={() => setShowModal(true)}
      >
        💳 Pay with M-Pesa
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => !loading && setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>M-Pesa Payment</h2>
              {!loading && (
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  ×
                </button>
              )}
            </div>

            <div className="modal-body">
              <div className="payment-summary">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="summary-item">
                      <span>{item.products.name} (x{item.quantity})</span>
                      <span>KSH {(item.products.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-total">
                  <strong>Total:</strong>
                  <strong>KSH {total.toLocaleString()}</strong>
                </div>
              </div>

              <form onSubmit={initiatePayment}>
                <div className="form-group">
                  <label htmlFor="phone">M-Pesa Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="e.g., 0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <small>Enter your Safaricom number registered with M-Pesa</small>
                </div>

                {message && (
                  <div className={`payment-message ${message.includes('successful') ? 'success' : message.includes('failed') ? 'error' : 'info'}`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Send STK Push'}
                </button>
              </form>

              <div className="payment-info">
                <p><strong>📱 How it works:</strong></p>
                <ol>
                  <li>Enter your M-Pesa registered phone number</li>
                  <li>You'll receive an STK push on your phone</li>
                  <li>Enter your M-Pesa PIN to complete payment</li>
                  <li>Wait for confirmation</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
