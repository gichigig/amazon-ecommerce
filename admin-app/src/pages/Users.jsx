import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Note: This requires proper RLS policies and admin access
      const { data, error } = await supabase.from('users').select('*')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-container"><p>Loading users...</p></div>
  }

  return (
    <div className="users-page">
      <h1>Users Management</h1>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Created At</th>
              <th>Last Sign In</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : 'Never'}
                </td>
                <td>
                  <button className="btn btn-small">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
