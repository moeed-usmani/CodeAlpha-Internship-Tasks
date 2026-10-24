import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../api.js';
import { productImage } from '../utils.js';

export default function ProductPage() {
  const { slug } = useParams();
  const { addToCart } = useStore();
  const [data, setData] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState({ x: 50, y: 50, on: false });

  useEffect(() => { setData(null); setQty(1); api.product(slug).then(setData).catch((e) => setError(e.message)); }, [slug]);

  if (error) return <p className="error center page-top">{error}</p>;
  if (!data) return <p className="muted center page-top">Loading…</p>;
  const { product: p, related } = data;

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
  };

  return (
    <section className="section page-top">
      <div className="detail">
        <div className="zoom" onMouseMove={move} onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}>
          <img src={productImage(p)} alt={p.name} style={{ transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: zoom.on ? 'scale(1.9)' : 'scale(1)' }} />
        </div>
        <div className="detail-info">
          <p className="eyebrow">{p.category}</p>
          <h2>{p.name}</h2>
          <p className="muted">★ {p.rating} · {p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}</p>
          <p className="price-big gold">${p.price.toLocaleString()}</p>
          <p className="desc">{p.description}</p>
          <div className="qty big">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))}>+</button>
          </div>
          <button className="btn-gold full" disabled={p.stock < 1} onClick={() => addToCart(p, qty)}>Add to bag</button>
        </div>
      </div>
      {!!related.length && (
        <>
          <div className="section-head" style={{ marginTop: 96 }}><h2>You may also like</h2></div>
          <div className="grid">{related.map((r, i) => <ProductCard key={r._id} p={r} index={i} />)}</div>
        </>
      )}
    </section>
  );
}
