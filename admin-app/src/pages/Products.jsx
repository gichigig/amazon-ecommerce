import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
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
    if (!imageFile) return formData.image_url

    setUploading(true)
    try {
      // Create unique filename
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image: ' + error.message)
      return formData.image_url
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Upload image if there's a new one
      let imageUrl = formData.image_url
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      const productData = {
        ...formData,
        image_url: imageUrl,
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert([productData])
        if (error) throw error
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
      stock: product.stock,
      image_url: product.image_url || '',
      active: product.active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      fetchProducts()
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
      stock: '',
      image_url: '',
      active: true,
    })
    setEditingProduct(null)
    setShowForm(false)
    setImageFile(null)
    setImagePreview(null)
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
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Image</label>
              <div className="image-upload-section">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="image-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="btn btn-secondary">
                  📁 Choose Image from Device
                </label>
                <small>Or enter image URL below (max 5MB)</small>
                
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                {!imageFile && (
                  <input
                    type="url"
                    placeholder="Or paste image URL"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    style={{ marginTop: '10px' }}
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading...' : editingProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" className="btn" onClick={resetForm} disabled={uploading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="table-img" />
                  )}
                </td>
                <td>{product.name}</td>
                <td>KSH {product.price.toLocaleString()}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`status ${product.active ? 'active' : 'inactive'}`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-small" onClick={() => handleEdit(product)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
