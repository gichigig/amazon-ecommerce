import { useState, useEffect } from 'react'
import { api } from '../lib/api'

// All 22 Amazon-style departments
const DEPARTMENTS = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'computers', name: 'Computers' },
  { id: 'smart-home', name: 'Smart Home' },
  { id: 'arts-crafts', name: 'Arts & Crafts' },
  { id: 'automotive', name: 'Automotive' },
  { id: 'baby', name: 'Baby' },
  { id: 'beauty', name: 'Beauty & Personal Care' },
  { id: 'womens-fashion', name: "Women's Fashion" },
  { id: 'mens-fashion', name: "Men's Fashion" },
  { id: 'girls-fashion', name: "Girls' Fashion" },
  { id: 'boys-fashion', name: "Boys' Fashion" },
  { id: 'health', name: 'Health & Household' },
  { id: 'home-kitchen', name: 'Home & Kitchen' },
  { id: 'industrial', name: 'Industrial & Scientific' },
  { id: 'luggage', name: 'Luggage' },
  { id: 'movies-tv', name: 'Movies & Television' },
  { id: 'pet-supplies', name: 'Pet Supplies' },
  { id: 'software', name: 'Software' },
  { id: 'sports', name: 'Sports & Outdoors' },
  { id: 'tools', name: 'Tools & Home Improvement' },
  { id: 'toys-games', name: 'Toys & Games' },
  { id: 'video-games', name: 'Video Games' },
]

// Sample Unsplash images for quick selection
const SAMPLE_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&h=300&fit=crop', name: 'Car Accessories' },
  { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', name: 'Headphones' },
  { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop', name: 'Smart Watch' },
  { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop', name: 'Sneakers' },
  { url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&h=300&fit=crop', name: 'Blender' },
  { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop', name: 'Laptop' },
  { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop', name: 'Smartphone' },
  { url: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=300&h=300&fit=crop', name: 'Sneakers Alt' },
  { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop', name: 'Handbag' },
  { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop', name: 'Beauty Products' },
  { url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=300&fit=crop', name: 'Gaming Console' },
  { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop', name: 'Sofa' },
]

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    imageUrl: '',
    department: '',
    active: true,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await api.getAllProducts()
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl

    setUploading(true)
    try {
      const result = await api.uploadProductImage(imageFile)
      return result.url
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image: ' + error.message)
      return formData.imageUrl
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Upload image if there's a new one
      let imageUrl = formData.imageUrl
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imageUrl: imageUrl,
        department: formData.department,
        active: formData.active,
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData)
      } else {
        await api.createProduct(productData)
      }

      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product: ' + error.message)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      department: product.department || '',
      active: product.active,
    })
    setShowForm(true)
    setShowImagePicker(false)
  }

  const handleDelete = (id) => {
    setDeleteConfirm(id)
  }

  const confirmDelete = async (id) => {
    try {
      await api.delete(`/api/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      stock: '',
      imageUrl: '',
      department: '',
      active: true,
    })
    setEditingProduct(null)
    setShowForm(false)
    setImageFile(null)
    setImagePreview(null)
    setShowImagePicker(false)
  }

  const selectSampleImage = (url) => {
    setFormData({ ...formData, imageUrl: url })
    setImagePreview(url)
    setShowImagePicker(false)
  }

  if (loading) {
    return <div className="loading-container"><p>Loading products...</p></div>
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  <option value="">Select a department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                placeholder="Describe the product..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (KES) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 4999"
                  required
                />
              </div>
              <div className="form-group">
                <label>Original Price (KES)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="e.g. 7999 (for showing discount)"
                />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="e.g. 100"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Image</label>
              <div className="image-upload-section">
                <div className="image-buttons">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="btn btn-secondary">
                    📁 Upload from Device
                  </label>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                  >
                    🖼️ Choose Sample Image
                  </button>
                </div>
                
                {showImagePicker && (
                  <div className="sample-images-grid">
                    <p className="sample-images-title">Click to select a sample image:</p>
                    <div className="sample-images">
                      {SAMPLE_IMAGES.map((img, index) => (
                        <div 
                          key={index} 
                          className="sample-image-item"
                          onClick={() => selectSampleImage(img.url)}
                        >
                          <img src={img.url} alt={img.name} />
                          <span>{img.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(imagePreview || formData.imageUrl) && (
                  <div className="image-preview">
                    <img src={imagePreview || formData.imageUrl} alt="Preview" />
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                        setFormData({ ...formData, imageUrl: '' })
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                {!imageFile && !showImagePicker && (
                  <input
                    type="url"
                    placeholder="Or paste image URL directly"
                    value={formData.imageUrl}
                    onChange={(e) => { setFormData({ ...formData, imageUrl: e.target.value }); setImagePreview(e.target.value); }}
                    style={{ marginTop: '10px' }}
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <span>Active (visible to customers)</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? '⏳ Uploading...' : editingProduct ? '💾 Update Product' : '➕ Create Product'}
              </button>
              <button type="button" className="btn" onClick={resetForm} disabled={uploading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <h3>⚠️ Delete Product</h3>
            <p>Are you sure you want to delete this product?</p>
            <p className="product-to-delete">
              {products.find(p => p.id === deleteConfirm)?.name}
            </p>
            <div className="modal-actions">
              <button 
                className="btn btn-danger"
                onClick={() => confirmDelete(deleteConfirm)}
              >
                🗑️ Yes, Delete
              </button>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Department</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="table-img" />
                  ) : (
                    <div className="no-image">📷</div>
                  )}
                </td>
                <td className="product-name-cell">
                  <strong>{product.name}</strong>
                  {product.description && (
                    <small className="product-desc">{product.description.substring(0, 50)}...</small>
                  )}
                </td>
                <td>
                  <span className="dept-badge">
                    {DEPARTMENTS.find(d => d.id === product.department)?.name || product.department || '-'}
                  </span>
                </td>
                <td className="price-cell">
                  <span className="current-price">KES {product.price?.toLocaleString()}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="original-price">KES {product.originalPrice?.toLocaleString()}</span>
                      <span className="discount-badge">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </td>
                <td>
                  <span className={`stock-badge ${product.stock < 10 ? 'low' : ''}`}>
                    {product.stock} {product.stock < 10 && '⚠️'}
                  </span>
                </td>
                <td>
                  <span className={`status ${product.active ? 'active' : 'inactive'}`}>
                    {product.active ? '✓ Active' : '✗ Inactive'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn btn-small btn-edit" onClick={() => handleEdit(product)}>
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="empty-state">
            <p>📦 No products yet. Click "Add New Product" to create your first product.</p>
          </div>
        )}
      </div>
    </div>
  )
}
