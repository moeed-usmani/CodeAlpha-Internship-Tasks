import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api.js';

const cats = ['All', 'Watches', 'Fragrance', 'Eyewear', 'Leather', 'Accessories'];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.products({ category, sort, q }).then(setProducts).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [category, sort, q]);

  return (
    <section className="section page-top">
      <div className="section-head">
        <p className="eyebrow">The Collection</p>
        <h2>Every piece, considered</h2>
      </div>
      <div className="filters">
        <div className="chips">
          {cats.map((c) => <button key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>{c}</button>)}
        </div>
        <div className="filter-right">
          <input className="input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>
      {error && <p className="error center">{error}</p>}
      {loading ? <p className="muted center">Loading…</p> : !products.length ? <p className="muted center">No pieces found.</p> :
        <div className="grid">{products.map((p, i) => <ProductCard key={p._id} p={p} index={i} />)}</div>}
    </section>
  );
}
