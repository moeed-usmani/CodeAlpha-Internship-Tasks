import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero3D from '../components/Hero3D.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api.js';

const perks = [
  ['Swiss Craftsmanship', 'Every piece is hand-finished by master artisans.'],
  ['Free Insured Shipping', 'Worldwide delivery on all orders over $200.'],
  ['Lifetime Warranty', 'We stand behind our work. Forever.'],
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api.products().then((d) => setFeatured(d.filter((p) => p.featured).slice(0, 4))).catch((e) => setError(e.message)); }, []);

  return (
    <>
      <section className="hero">
        <Hero3D />
        <div className="hero-text">
          <motion.p className="eyebrow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>The 2026 Atelier Collection</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}>
            Timeless <em>luxury,</em><br />made to be worn.
          </motion.h1>
          <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            Watches, fragrance and leather goods, crafted in small batches for people who notice the details.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <Link to="/shop" className="btn-gold">Explore Collection</Link>
          </motion.div>
        </div>
        <div className="scroll-hint">Scroll</div>
      </section>

      <div className="marquee"><div className="marquee-track">
        {Array.from({ length: 2 }).map((_, k) => (
          <span key={k}>WATCHES ✦ FRAGRANCE ✦ EYEWEAR ✦ LEATHER ✦ ACCESSORIES ✦ WATCHES ✦ FRAGRANCE ✦ EYEWEAR ✦ LEATHER ✦ ACCESSORIES ✦ </span>
        ))}
      </div></div>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Curated for you</p>
          <h2>Featured pieces</h2>
        </div>
        {error && <p className="error center">{error} — check that the backend is running and seeded.</p>}
        <div className="grid">{featured.map((p, i) => <ProductCard key={p._id} p={p} index={i} />)}</div>
        <div className="center" style={{ marginTop: 48 }}><Link to="/shop" className="btn-line">View all pieces</Link></div>
      </section>

      <section className="section perks">
        {perks.map(([t, d], i) => (
          <motion.div key={t} className="perk" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
            <span className="perk-num">0{i + 1}</span>
            <h4>{t}</h4>
            <p className="muted">{d}</p>
          </motion.div>
        ))}
      </section>
    </>
  );
}
