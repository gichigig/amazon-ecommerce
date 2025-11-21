import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (email),
          order_items (
            *,
            products (name, price)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
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
                  <p className="order-email">{order.users?.email}</p>
                  <p className="order-date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.order_items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.products?.name}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>KSH {item.products?.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <strong>Total: KSH {order.total_amount.toLocaleString()}</strong>
                {order.mpesa_phone && (
                  <p className="payment-info">M-Pesa: {order.mpesa_phone}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
