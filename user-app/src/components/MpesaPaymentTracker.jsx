import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'

export default function MpesaPaymentTracker({ orderId, onPaymentComplete, onPaymentFailed }) {
  const [status, setStatus] = useState('pending')
  const [message, setMessage] = useState('Waiting for M-Pesa payment...')
  const [receiptNumber, setReceiptNumber] = useState(null)
  const intervalRef = useRef(null)
  const attemptsRef = useRef(0)
  const maxAttempts = 60 // Check for 5 minutes (every 5 seconds)

  useEffect(() => {
    if (!orderId) return

    // Start polling for payment status
    const checkPaymentStatus = async () => {
      try {
        const result = await api.getPaymentStatus(orderId)
        
        if (result.isPaid) {
          setStatus('success')
          setMessage('Payment successful!')
          setReceiptNumber(result.mpesaReceiptNumber)
          clearInterval(intervalRef.current)
          if (onPaymentComplete) {
            onPaymentComplete(result)
          }
        } else if (result.status === 'CANCELLED') {
          setStatus('failed')
          setMessage('Payment was cancelled or failed')
          clearInterval(intervalRef.current)
          if (onPaymentFailed) {
            onPaymentFailed(result)
          }
        } else {
          attemptsRef.current += 1
          if (attemptsRef.current >= maxAttempts) {
            setStatus('timeout')
            setMessage('Payment verification timed out. Please check your order status.')
            clearInterval(intervalRef.current)
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }

    // Initial check
    checkPaymentStatus()

    // Poll every 5 seconds
    intervalRef.current = setInterval(checkPaymentStatus, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [orderId, onPaymentComplete, onPaymentFailed])

  return (
    <div className={`payment-status ${status}`}>
      {status === 'pending' && (
        <div className="payment-checking">
          <div className="payment-spinner"></div>
          <span>{message}</span>
        </div>
      )}
      
      {status === 'success' && (
        <div className="payment-success">
          <span className="success-icon">✓</span>
          <p>{message}</p>
          {receiptNumber && (
            <p className="receipt-number">Receipt: {receiptNumber}</p>
          )}
        </div>
      )}
      
      {status === 'failed' && (
        <div className="payment-failed">
          <span className="failed-icon">✗</span>
          <p>{message}</p>
        </div>
      )}
      
      {status === 'timeout' && (
        <div className="payment-timeout">
          <span className="timeout-icon">⏱</span>
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}
