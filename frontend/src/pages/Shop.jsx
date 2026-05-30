import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'General'];
const SORTS = [
  { value: 'newest', label: '🆕 Newest' },
  { value: 'price-low', label: '💰 Price: Low to High' },
  { value: 'price-high', label: '💎 Price: High to Low' },
  { value: 'rating', label: '⭐ Top Rated' },
];

function Skeleton() {
  return <div style={{ borderRadius: 20, paddingTop: '120%', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />;
}

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [appliedMax, setAppliedMax] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sort });
      if (category !== 'All') params.set('category', category);
      if (search) params.set('search', search);
      if (appliedMax > 0) params.set('maxPrice', appliedMax);
      const data = await productAPI.getAll(params.toString());
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page, sort, category, search, appliedMax]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [category, sort, search, appliedMax]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };
  const clearFilters = () => { setCategory('All'); setSort('newest'); setSearch(''); setSearchInput(''); setAppliedMax(0); setMaxPrice(50000); };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc, #eef2ff)', paddingBottom: 56 }}>
        {/* HEADER */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)' }}>
          <div className="shop-head" style={{ maxWidth: 1200, margin: '0 auto', animation: 'fadeDown 0.6s ease both' }}>
            <h1 className="shop-title" style={{ fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 8 }}>🛍️ Shop All Products</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>{total > 0 ? `Browse ${total} amazing products` : 'Discover our collection'}</p>
            <form onSubmit={handleSearch} style={{ marginTop: 20, display: 'flex', gap: 8, maxWidth: 600, background: '#fff', padding: 6, borderRadius: 14, boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}>
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="🔍 Search products..." style={{ flex: 1, border: 'none', outline: 'none', padding: '11px 14px', fontSize: 14.5, borderRadius: 10, color: '#1e293b', minWidth: 0 }} />
              <button type="submit" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: 10, fontWeight: 800, fontSize: 14.5, cursor: 'pointer', whiteSpace: 'nowrap' }}>Search</button>
            </form>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
          {/* Mobile filter toggle */}
          <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)} style={{ display: 'none', width: '100%', background: '#fff', border: '1px solid #e2e8f0', padding: 13, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 16, color: '#475569' }}>
            {showFilters ? '✕ Hide Filters' : '⚙️ Filters & Sort'}
          </button>

          {/* FILTER BAR */}
          <div className={`filter-bar ${showFilters ? 'show' : ''}`} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                return <button key={cat} onClick={() => setCategory(cat)} style={{ border: 'none', padding: '8px 16px', borderRadius: 100, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#fff', color: active ? '#fff' : '#64748b', boxShadow: active ? '0 6px 16px rgba(99,102,241,0.3)' : '0 2px 6px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>{cat}</button>;
              })}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '10px 16px', borderRadius: 11, fontWeight: 700, fontSize: 13.5, color: '#475569', cursor: 'pointer', outline: 'none' }}>
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', padding: '8px 16px', borderRadius: 11, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Max: PKR {Number(maxPrice).toLocaleString()}</span>
                <input type="range" min="1000" max="50000" step="1000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} onMouseUp={() => setAppliedMax(Number(maxPrice))} onTouchEnd={() => setAppliedMax(Number(maxPrice))} style={{ accentColor: '#6366f1' }} />
              </div>
              <button onClick={clearFilters} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 16px', borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Clear All</button>
            </div>
          </div>

          {/* PRODUCTS */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 18 }}>
              {Array(8).fill(0).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 24, padding: '70px 30px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 10 }}>No products found</h2>
              <p style={{ color: '#64748b', fontSize: 15, marginBottom: 20 }}>Try adjusting your filters</p>
              <button onClick={clearFilters} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 18 }}>
                {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 44, flexWrap: 'wrap' }}>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '10px 16px', borderRadius: 11, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, fontSize: 14, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, color: '#475569' }}>← Prev</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} style={{ width: 42, height: 42, borderRadius: 11, border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', background: page === p ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#fff', color: page === p ? '#fff' : '#475569', boxShadow: page === p ? '0 6px 16px rgba(99,102,241,0.3)' : '0 2px 6px rgba(0,0,0,0.04)' }}>{p}</button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '10px 16px', borderRadius: 11, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, fontSize: 14, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, color: '#475569' }}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

const css = `
  @keyframes fadeDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .shop-head { padding: 40px 16px 32px; }
  .shop-title { font-size: 36px; }
  @media (max-width: 768px) {
    .shop-head { padding: 28px 16px 24px; }
    .shop-title { font-size: 26px; }
    .filter-toggle { display: block !important; }
    .filter-bar { display: none; }
    .filter-bar.show { display: block; }
  }
`;
