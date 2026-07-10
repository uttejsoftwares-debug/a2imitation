'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DashboardData = {
  stats: {
    products: number;
    orders: number;
    customers: number;
    revenue: number;
  };
  products: Array<{ id: string; name: string; sku: string; stock: number; price: number; category?: { name: string }; images?: Array<{ url: string }> }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  orders: Array<{ id: string; orderNumber: string; status: string; total: number }>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || process.env.API_INTERNAL_URL || 'http://localhost:4000';

type Tab = 'dashboard' | 'products' | 'categories' | 'orders';
type EditingProduct = { id: string; name: string; sku: string; price: number; stock: number; categoryName: string; description: string; imageDataUrls?: string[] } | null;

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '4999',
    stock: '10',
    categoryName: 'Bridal Sets',
    description: 'Luxury imitation jewellery piece',
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFileImages, setSelectedFileImages] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<EditingProduct>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const authFetch = async (path: string, options: RequestInit = {}) => {
    if (!adminToken) throw new Error('Missing admin token');
    const headers = new Headers(options.headers as HeadersInit);
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Authorization', `Bearer ${adminToken}`);

    const response = await fetch(path, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('a2-admin-token');
      router.replace('/login');
    }
    return response;
  };

  const loadDashboard = async () => {
    setLoading(true);
    const response = await authFetch(`${API_BASE}/api/admin/dashboard`);
    const payload = await response.json();
    setData(payload);
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('a2-admin-token');
    if (!token) {
      router.replace('/login');
    } else {
      setAdminToken(token);
    }
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (adminToken) {
      loadDashboard();
    }
  }, [adminToken]);

  const handleLogout = () => {
    localStorage.removeItem('a2-admin-token');
    setAdminToken(null);
    router.replace('/login');
  };

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setSelectedFileImages(files);

    const readers = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    );

    const dataUrls = await Promise.all(readers);
    setSelectedImages(dataUrls);
  };

  const handleCreateProduct = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('sku', form.sku);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    formData.append('categoryName', form.categoryName);
    formData.append('description', form.description);

    selectedFileImages.forEach((file) => formData.append('images', file));

    if (editingProduct) {
      const response = await authFetch(`${API_BASE}/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        body: formData,
      });
      if (response.ok) {
        setEditingProduct(null);
        resetProductForm();
        await loadDashboard();
      }
      return;
    }

    const response = await authFetch(`${API_BASE}/api/admin/products`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      resetProductForm();
      await loadDashboard();
    }
  };

  const resetProductForm = () => {
    setForm({ name: '', sku: '', price: '4999', stock: '10', categoryName: 'Bridal Sets', description: 'Luxury imitation jewellery piece' });
    setSelectedImages([]);
    setSelectedFileImages([]);
    setEditingProduct(null);
  };

  const startEditProduct = (product: any) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      categoryName: product.category?.name || 'General',
      description: product.description,
    });
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      stock: String(product.stock),
      categoryName: product.category?.name || 'General',
      description: product.description,
    });
    setSelectedImages(product.images?.map((img: any) => img.url) || []);
    setSelectedFileImages([]);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    const response = await authFetch(`${API_BASE}/api/admin/products/${productId}`, { method: 'DELETE' });
    if (response.ok) {
      await loadDashboard();
    }
  };

  const handleCreateCategory = async (event: FormEvent) => {
    event.preventDefault();
    const response = await authFetch(`${API_BASE}/api/admin/categories`, {
      method: 'POST',
      body: JSON.stringify({
        name: categoryForm.name,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }),
    });
    if (response.ok) {
      setCategoryForm({ name: '', slug: '' });
      await loadDashboard();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const response = await authFetch(`${API_BASE}/api/admin/categories/${categoryId}`, { method: 'DELETE' });
      if (response.ok) {
        await loadDashboard();
      }
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const handleConfirmOrder = async (orderId: string) => {
    if (!confirm('Confirm this order?')) return;
    const response = await authFetch(`${API_BASE}/api/orders/${orderId}/confirm`, { method: 'POST' });
    if (response.ok) await loadDashboard();
  };

  if (!authChecked) {
    return <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)', color: '#f8fafc', padding: 24 }}><p>Checking authentication…</p></main>;
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)', color: '#f8fafc', padding: 24 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gap: 24 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="A2 logo" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 999 }} />
            <div>
              <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.32em', color: '#fbbf24', textTransform: 'uppercase' }}>A2 Jewellery</p>
              <h1 style={{ margin: '6px 0 0', fontSize: 30 }}>Admin Control Center</h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', padding: '10px 14px', borderRadius: 999, color: '#fde68a' }}>
              Live inventory & orders
            </div>
            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', color: '#f8fafc', padding: '10px 14px', borderRadius: 999, cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </header>

        <nav style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 0 }}>
          {(['dashboard', 'products', 'categories', 'orders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setEditingProduct(null); resetProductForm(); }}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab ? 'rgba(251,191,36,0.2)' : 'transparent',
                color: activeTab === tab ? '#fbbf24' : '#94a3b8',
                borderBottom: activeTab === tab ? '2px solid #fbbf24' : 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: activeTab === tab ? 600 : 400,
                transition: 'all 0.3s',
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        {loading || !data ? (
          <p>Loading dashboard…</p>
        ) : activeTab === 'dashboard' ? (
          <>
            <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {[
                { label: 'Products', value: data.stats.products, accent: '#fbbf24' },
                { label: 'Orders', value: data.stats.orders, accent: '#38bdf8' },
                { label: 'Customers', value: data.stats.customers, accent: '#34d399' },
                { label: 'Revenue', value: formatCurrency(data.stats.revenue), accent: '#f472b6' },
              ].map((card) => (
                <div key={card.label} style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: 18 }}>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>{card.label}</p>
                  <p style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 700, color: card.accent }}>{card.value}</p>
                </div>
              ))}
            </section>

            <section style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 20 }}>
                <h2 style={{ margin: '0 0 16px' }}>Recent products</h2>
                <div style={{ display: 'grid', gap: 10 }}>
                  {data.products.slice(0, 4).map((product) => (
                    <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '12px 14px', borderRadius: 12 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{product.name}</p>
                        <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 12 }}>{product.sku}</p>
                      </div>
                      <p style={{ margin: 0, color: '#34d399', fontSize: 12 }}>Stock: {product.stock}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 20 }}>
                <h2 style={{ margin: '0 0 16px' }}>Recent orders</h2>
                <div style={{ display: 'grid', gap: 10 }}>
                  {data.orders.slice(0, 4).map((order) => (
                    <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '12px 14px', borderRadius: 12 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{order.orderNumber}</p>
                        <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 12 }}>{order.status}</p>
                      </div>
                      <p style={{ margin: 0 }}>{formatCurrency(order.total)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : activeTab === 'products' ? (
          <section style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 20 }}>
              <h2 style={{ margin: '0 0 16px' }}>{editingProduct ? 'Edit product' : 'Add product'}</h2>
              <form onSubmit={handleCreateProduct} style={{ display: 'grid', gap: 12 }}>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" required style={inputStyle} />
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" required style={inputStyle} />
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" required style={inputStyle} />
                <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" required style={inputStyle} />
                <input value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} placeholder="Category" style={inputStyle} />
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: '#cbd5e1', fontSize: 13 }}>Product images</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelection} style={{ color: '#f8fafc' }} />
                </label>
                {selectedImages.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedImages.map((image, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img src={image} alt={`Preview ${index}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)' }} />
                        <button
                          type="button"
                          onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                          style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" style={{ flex: 1, background: '#fbbf24', color: '#111827', border: 'none', borderRadius: 8, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>
                    {editingProduct ? 'Update product' : 'Save product'}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={resetProductForm} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 20, maxHeight: '600px', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 16px' }}>All products</h2>
              <div style={{ display: 'grid', gap: 8 }}>
                {data.products.map((product) => (
                  <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '12px 14px', borderRadius: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{product.name}</p>
                      <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 11 }}>{product.sku} • {formatCurrency(product.price)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEditProduct(product)} style={{ padding: '6px 10px', background: '#38bdf8', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 12 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} style={{ padding: '6px 10px', background: '#ef4444', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 12 }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : activeTab === 'categories' ? (
          <section style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 20 }}>
              <h2 style={{ margin: '0 0 16px' }}>Add category</h2>
              <form onSubmit={handleCreateCategory} style={{ display: 'grid', gap: 12 }}>
                <input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name" required style={inputStyle} />
                <input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} placeholder="Slug (auto-fill)" style={inputStyle} />
                <button type="submit" style={{ background: '#fbbf24', color: '#111827', border: 'none', borderRadius: 8, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>
                  Create category
                </button>
              </form>
            </div>

            <div style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 20 }}>
              <h2 style={{ margin: '0 0 16px' }}>All categories</h2>
              <div style={{ display: 'grid', gap: 8 }}>
                {data.categories.map((cat) => (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '12px 14px', borderRadius: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{cat.name}</p>
                      <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 12 }}>/{cat.slug}</p>
                    </div>
                    <button onClick={() => handleDeleteCategory(cat.id)} style={{ padding: '6px 10px', background: '#ef4444', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 12 }}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : activeTab === 'orders' ? (
          <div style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 20 }}>
            <h2 style={{ margin: '0 0 16px' }}>All orders</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {data.orders.map((order) => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '14px 16px', borderRadius: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{order.orderNumber}</p>
                    <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 12 }}>{order.status}</p>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{formatCurrency(order.total)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.13)',
  background: 'rgba(255,255,255,0.04)',
  color: '#f8fafc',
};
