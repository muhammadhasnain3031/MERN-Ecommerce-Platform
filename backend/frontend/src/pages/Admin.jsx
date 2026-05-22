import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminOrders from '../components/AdminOrders';

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

export default function Admin() {
  const { user, token } = useSelector((s) => s.auth);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState('products');
  const [editProduct, setEditProduct] = useState(null);

  const [previewImgs, setPreviewImgs] = useState([]);
  const [files, setFiles] = useState([]);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [dragOver, setDragOver] = useState(false);

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    brand: '',
    featured: false,
    imageUrl: '',
  };

  const [form, setForm] = useState(emptyForm);

  const TABS = [
    { key: 'products', icon: '📦', label: 'Products' },
    {
      key: 'add',
      icon: '➕',
      label: editProduct ? 'Edit Product' : 'Add Product',
    },
    { key: 'orders', icon: '🛒', label: 'Orders' },
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(
        'https://mern-ecommerce-platform-olhz.vercel.app/api/products?limit=100',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      );

      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    fetchProducts();
  }, [user, navigate, fetchProducts]);

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith('image/')
    );

    const limitedFiles = [...files, ...validFiles].slice(0, 5);
    setFiles(limitedFiles);

    validFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        setPreviewImgs((prev) => {
          const updated = [...prev, e.target.result];
          return updated.slice(0, 5);
        });
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

    if (!form.name || !form.price) {
      setError('Name and price required');
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

      files.forEach((file) => {
        formData.append('images', file);
      });

      const url = editProduct
        ? `https://mern-ecommerce-platform-olhz.vercel.app/api/products/${editProduct._id}`
        : 'https://mern-ecommerce-platform-olhz.vercel.app/api/products';

      const method = editProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: 'Bearer ' + token,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed');
      }

      setSuccess(
        editProduct
          ? 'Product updated successfully!'
          : 'Product added successfully!'
      );

      setTimeout(() => setSuccess(''), 3000);

      fetchProducts();

      setForm(emptyForm);
      setFiles([]);
      setPreviewImgs([]);
      setEditProduct(null);
      setActiveTab('products');
    } catch (err) {
      setError(err.message);
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
      imageUrl: '',
    });

    setPreviewImgs(
      product.images?.length
        ? product.images
        : product.image
        ? [product.image]
        : []
    );

    setFiles([]);
    setActiveTab('add');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Delete this product?');
    if (!confirmDelete) return;

    try {
      await fetch(`https://mern-ecommerce-platform-olhz.vercel.app/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const inp = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #ddd',
    fontSize: 14,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0f172a,#1e3a8a)',
          padding: 20,
        }}
      >
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800 }}>
          ⚙️ Admin Panel
        </h1>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background:
                  activeTab === tab.key ? '#2563eb' : 'rgba(255,255,255,.15)',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <h2>📦 Products ({products.length})</h2>

            {loading ? (
              <p>Loading...</p>
            ) : (
              products.map((p) => (
                <div
                  key={p._id}
                  style={{
                    background: '#fff',
                    padding: 16,
                    marginTop: 10,
                    borderRadius: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    <img
                      src={p.image || p.images?.[0] || '/placeholder.png'}
                      alt=""
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 10,
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <h4>{p.name}</h4>
                      <p>{p.category}</p>
                      <strong>PKR {p.price}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ADD / EDIT */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 20 }}>
            <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <input
              style={inp}
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <br /><br />

            <input
              style={inp}
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <br /><br />

            <textarea
              style={inp}
              rows={4}
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <br /><br />

            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editProduct ? 'Update' : 'Add'}
            </button>
          </form>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <AdminOrders token={token} />
        )}
      </div>
    </div>
  );
}