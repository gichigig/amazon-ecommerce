import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const data = await api.getMyProducts()
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      imageUrl: ''
    })
    setShowModal(true)
  }

  function openEditModal(product) {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || ''
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData)
      } else {
        await api.createProduct(productData)
      }

      setShowModal(false)
      loadProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      alert(error.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await api.deleteProduct(id)
      loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert(error.message)
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    try {
      const result = await api.uploadProductImage(file)
      setFormData({ ...formData, imageUrl: result.url })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>My Products</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Product
        </button>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div style={{ width: 50, height: 50, background: '#eee', borderRadius: 4 }} />
                  )}
                </td>
                <td>{product.name}</td>
                <td>KES {product.price?.toLocaleString()}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`status-badge ${product.active ? 'status-paid' : 'status-cancelled'}`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="product-actions">
                    <button className="btn btn-secondary" onClick={() => openEditModal(product)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No products yet. Click "Add Product" to create your first product!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Price (KES) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={e => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {formData.imageUrl && (
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    style={{ width: 100, height: 100, objectFit: 'cover', marginTop: 8, borderRadius: 4 }}
                  />
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
