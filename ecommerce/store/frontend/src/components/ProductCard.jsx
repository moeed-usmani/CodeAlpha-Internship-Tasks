import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { productImage } from '../utils.js';

export default function ProductCard({ p, index = 0 }) {
  const { addToCart } = useStore();
  const ref = useRef(null);

  const tilt = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
  };
  const reset = () => { ref.current.style.transform = ''; };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay: (index % 4) * 0.08 }}>
      <div ref={ref} className="card" onMouseMove={tilt} onMouseLeave={reset}>
        <Link to={`/product/${p.slug}`} className="card-img">
          <img src={productImage(p)} alt={p.name} loading="lazy" />
          <span className="tag">{p.category}</span>
        </Link>
        <div className="card-body">
          <Link to={`/product/${p.slug}`}><h4>{p.name}</h4></Link>
          <div className="row">
            <span className="gold price">${p.price.toLocaleString()}</span>
            <span className="muted">★ {p.rating}</span>
          </div>
          <button className="btn-line full" disabled={p.stock < 1} onClick={() => addToCart(p)}>
            {p.stock < 1 ? 'Sold out' : 'Add to bag'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
