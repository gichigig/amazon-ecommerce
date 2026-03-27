import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const data = await api.getMyOrders()
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(orderId, status) {
    try {
      await api.updateOrderStatus(orderId, status)
      loadOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      alert(error.message)
    }
  }

  function getStatusClass(status) {
    const statusMap = {
      'PENDING': 'status-pending',
      'PAID': 'status-paid',
      'SHIPPED': 'status-shipped',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled'
    }
    return statusMap[status] || 'status-pending'
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id?.slice(0, 8)}</td>
                <td>{order.userEmail || 'N/A'}</td>
                <td>
                  {order.items?.map(item => (
                    <div key={item.id} style={{ fontSize: '0.85rem' }}>
                      {item.productName} × {item.quantity}
                    </div>
                  ))}
                </td>
                <td>KES {order.totalAmount?.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    style={{ padding: '0.25rem', borderRadius: 4 }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
