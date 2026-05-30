import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminOrders from '../components/AdminOrders';
import { productAPI } from '../services/api';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home',
  'Sports',
  'Beauty',
  'Toys',
  'General',
];

// ✅ INLINE SVG - No external file needed!
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f1f5f9" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="60" text-anchor="middle" dy=".3em" fill="%2394a3b8"%3E📦%3C/text%3E%3C/svg%3E';

export default function Admin() {
  const { user, token } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editProduct, setEditProduct] = useState(null);
  const [previewImgs, setPreviewImgs] = useState([]);
  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    featured: 0,
  });

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    brand: '',
    featured: false,
  };

  const [form, setForm] = useState(emptyForm);

  const TABS = [
    { key: 'overview', icon: '📊', label: 'Dashboard' },
    { key: 'products', icon: '📦', label: 'Products' },
    { key: 'add', icon: '➕', label: editProduct ? 'Edit Product' : 'Add Product' },
    { key: 'orders', icon: '🛒', label: 'Orders' },
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productAPI.getAll('limit=500');
      const productList = Array.isArray(data.products) ? data.products : [];
      setProducts(productList);
      
      setStats({
        totalProducts: productList.length,
        lowStock: productList.filter(p => p.stock > 0 && p.stock < 10).length,
        outOfStock: productList.filter(p => p.stock === 0).length,
        featured: productList.filter(p => p.featured).length,
      });
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [user, navigate, fetchProducts]);

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter((f) => f.type.startsWith('image/'));
    const limitedFiles = [...files, ...validFiles].slice(0, 5);
    setFiles(limitedFiles);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImgs((prev) => [...prev, e.target.result].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewImgs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Prevent duplicate submission
    if (saving) return;
    
    if (!form.name || !form.price) {
      setError('Name and price are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null) {
          formData.append(key, value);
        }
      });
      files.forEach((file) => formData.append('images', file));

      if (editProduct) {
        await productAPI.update(editProduct._id, formData);
      } else {
        await productAPI.create(formData);
      }

      setSuccess(editProduct ? 'Product updated successfully!' : 'Product added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      fetchProducts();
      setForm(emptyForm);
      setFiles([]);
      setPreviewImgs([]);
      setEditProduct(null);
      setActiveTab('products');
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
    setSaving(false);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || 'Electronics',
      stock: product.stock || '',
      brand: product.brand || '',
      featured: product.featured || false,
    });
    setPreviewImgs(
      product.images?.length ? product.images : product.image ? [product.image] : []
    );
    setFiles([]);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.delete(id);
      fetchProducts();
      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: 10,
    border: 'none',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
                ⚙️ Admin Dashboard
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                Manage your International Ecommerce Store
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 10 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Logged in as</span>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginTop: 2 }}>
                  {user?.name || user?.email}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === tab.key 
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)' 
                    : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  transition: 'all 0.2s',
                  boxShadow: activeTab === tab.key ? '0 4px 12px rgba(59,130,246,0.4)' : 'none',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* Success/Error Messages */}
        {success && (
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            padding: '16px 20px',
            borderRadius: 12,
            marginBottom: 20,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
          }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff',
            padding: '16px 20px',
            borderRadius: 12,
            marginBottom: 20,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
          }}>
            ❌ {error}
          </div>
        )}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: '#1e293b' }}>
              📊 Dashboard Overview
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
              {[
                { label: 'Total Products', value: stats.totalProducts, icon: '📦', bg: '#dbeafe' },
                { label: 'Low Stock', value: stats.lowStock, icon: '⚠️', bg: '#fef3c7' },
                { label: 'Out of Stock', value: stats.outOfStock, icon: '❌', bg: '#fee2e2' },
                { label: 'Featured', value: stats.featured, icon: '⭐', bg: '#ede9fe' },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: '#fff',
                  padding: 24,
                  borderRadius: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                        {stat.label}
                      </p>
                      <p style={{ fontSize: 32, fontWeight: 900, color: '#1e293b' }}>
                        {stat.value}
                      </p>
                    </div>
                    <div style={{
                      background: stat.bg,
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                    }}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#1e293b' }}>
                🔥 Quick Actions
              </h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('add')} style={{
                  ...buttonStyle,
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                }}>
                  ➕ Add New Product
                </button>
                <button onClick={() => setActiveTab('products')} style={{
                  ...buttonStyle,
                  background: '#f1f5f9',
                  color: '#1e293b',
                }}>
                  📦 View All Products
                </button>
                <button onClick={() => setActiveTab('orders')} style={{
                  ...buttonStyle,
                  background: '#f1f5f9',
                  color: '#1e293b',
                }}>
                  🛒 Manage Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>
                📦 Products ({filteredProducts.length})
              </h2>
              <button onClick={() => {
                setEditProduct(null);
                setForm(emptyForm);
                setPreviewImgs([]);
                setFiles([]);
                setActiveTab('add');
              }} style={{
                ...buttonStyle,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              }}>
                ➕ Add New Product
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, flex: '1 1 300px' }}
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ ...inputStyle, width: 'auto', minWidth: 180 }}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
                <p style={{ fontWeight: 600 }}>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16 }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>📦</div>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#64748b' }}>
                  {searchQuery || filterCategory !== 'All' ? 'No products found' : 'No products yet'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {filteredProducts.map((p) => (
                  <div key={p._id} style={{
                    background: '#fff',
                    padding: 20,
                    borderRadius: 16,
                    display: 'flex',
                    gap: 20,
                    alignItems: 'center',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    e.currentTarget.style.transform = 'none';
                  }}>
                    <img
                      src={(p.image && p.image.trim()) || (p.images?.[0] && p.images[0].trim()) || PLACEHOLDER_IMAGE}
                      alt={p.name}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 12,
                        objectFit: 'cover',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                      }}
                      onError={(e) => {
                        if (e.target.src !== PLACEHOLDER_IMAGE) {
                          e.target.src = PLACEHOLDER_IMAGE;
                        }
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{p.name}</h4>
                        {p.featured && (
                          <span style={{
                            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}>⭐ Featured</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                        <p style={{ fontSize: 13, color: '#64748b' }}>
                          <strong>Category:</strong> {p.category}
                        </p>
                        <p style={{ fontSize: 13, color: '#64748b' }}>
                          <strong>Price:</strong> PKR {p.price?.toLocaleString()}
                        </p>
                        <p style={{ fontSize: 13, color: p.stock === 0 ? '#ef4444' : p.stock < 10 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                          <strong>Stock:</strong> {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                        </p>
                      </div>
                      {p.brand && (
                        <p style={{ fontSize: 12, color: '#94a3b8' }}>
                          <strong>Brand:</strong> {p.brand}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(p)} style={{
                        ...buttonStyle,
                        background: '#3b82f6',
                        color: '#fff',
                        padding: '8px 16px',
                      }}>✏️ Edit</button>
                      <button onClick={() => handleDelete(p._id)} style={{
                        ...buttonStyle,
                        background: '#ef4444',
                        color: '#fff',
                        padding: '8px 16px',
                      }}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD / EDIT FORM */}
        {activeTab === 'add' && (
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: '#1e293b' }}>
              {editProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 20 }}>
                {/* Product Name */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#475569' }}>
                    Product Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Price and Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#475569' }}>
                      Price (PKR) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      style={inputStyle}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#475569' }}>
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      style={inputStyle}
                      min="0"
                    />
                  </div>
                </div>

                {/* Category and Brand */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#475569' }}>
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      style={inputStyle}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#475569' }}>
                      Brand
                    </label>
                    <input
                      type="text"
                      placeholder="Enter brand name"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#475569' }}>
                    Description
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Enter product description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Featured Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="featured" style={{ fontWeight: 600, fontSize: 14, color: '#475569', cursor: 'pointer' }}>
                    ⭐ Mark as Featured Product
                  </label>
                </div>

                {/* Image Upload */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#475569' }}>
                    Product Images (Max 5)
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? '#3b82f6' : '#cbd5e1'}`,
                      borderRadius: 12,
                      padding: 40,
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: dragOver ? '#eff6ff' : '#f8fafc',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                    <p style={{ fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Click or drag images here
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>
                      PNG, JPG, JPEG up to 5 images
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFiles(e.target.files)}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {previewImgs.length > 0 && (
                    <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                      {previewImgs.map((img, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img
                            src={img}
                            alt={`Preview ${i + 1}`}
                            style={{
                              width: 100,
                              height: 100,
                              objectFit: 'cover',
                              borderRadius: 10,
                              border: '2px solid #e2e8f0',
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                            style={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              fontSize: 14,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      ...buttonStyle,
                      background: saving ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      flex: 1,
                      padding: '14px',
                      fontSize: 16,
                      boxShadow: saving ? 'none' : '0 4px 12px rgba(16,185,129,0.3)',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? '⏳ Saving...' : editProduct ? '✅ Update Product' : '✅ Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(emptyForm);
                      setFiles([]);
                      setPreviewImgs([]);
                      setEditProduct(null);
                      setActiveTab('products');
                    }}
                    style={{
                      ...buttonStyle,
                      background: '#f1f5f9',
                      color: '#475569',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && <AdminOrders token={token} />}
      </div>
    </div>
  );
}