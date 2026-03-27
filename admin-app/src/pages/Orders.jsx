import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await api.getAllOrders()
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order: ' + error.message)
    }
  }

  if (loading) {
    return <div className="loading-container"><p>Loading orders...</p></div>
  }

  return (
    <div className="orders-page">
      <h1>Orders Management</h1>

      <div className="orders-list">
        {orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id.slice(0, 8)}</h3>
                  <p className="order-email">{order.userEmail}</p>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PENDING_PAYMENT">Pending Payment</option>
                    <option value="PAID">Paid</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.productName}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>KSH {item.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <strong>Total: KSH {order.totalAmount.toLocaleString()}</strong>
                {order.mpesaPhone && (
                  <p className="payment-info">M-Pesa: {order.mpesaPhone}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
