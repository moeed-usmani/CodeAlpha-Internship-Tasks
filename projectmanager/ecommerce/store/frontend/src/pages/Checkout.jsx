import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../api.js';

export default function Checkout() {
  const { cart, subtotal, auth, clearCart } = useStore();
  const [ship, setShip] = useState({ fullName: auth?.user.name || '', address: '', city: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setShip({ ...ship, [k]: e.target.value });

  if (!auth) return <Navigate to="/login" state={{ from: '/checkout' }} replace />;
  if (done) return (
    <section className="auth page-top">
      <div className="auth-card center">
        <div className="check">✓</div>
        <h2>Order confirmed</h2>
        <p className="muted">Order #{done._id.slice(-8).toUpperCase()} · Total <span className="gold">${done.total.toLocaleString()}</span></p>
        <Link to="/orders" className="btn-gold">View my orders</Link>
      </div>
    </section>
  );
  if (!cart.length) return <section className="auth page-top"><div className="auth-card center"><h2>Your bag is empty</h2><Link to="/shop" className="btn-gold">Browse collection</Link></div></section>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const order = await api.placeOrder({ items: cart.map((i) => ({ product: i._id, qty: i.qty })), shipping: ship }, auth.token);
      clearCart();
      setDone(order);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <section className="section page-top">
      <div className="section-head"><p className="eyebrow">Secure checkout</p><h2>Complete your order</h2></div>
      <div className="checkout">
        <form onSubmit={submit} className="stack">
          <input className="input" placeholder="Full name" value={ship.fullName} onChange={set('fullName')} required />
          <input className="input" placeholder="Address" value={ship.address} onChange={set('address')} required />
          <input className="input" placeholder="City" value={ship.city} onChange={set('city')} required />
          <input className="input" placeholder="Phone" value={ship.phone} onChange={set('phone')} required />
          {error && <p className="error">{error}</p>}
          <button className="btn-gold full" disabled={busy}>{busy ? 'Placing order…' : `Place order · $${subtotal.toLocaleString()}`}</button>
          <p className="muted small">Demo store: payment is simulated (pay on delivery).</p>
        </form>
        <div className="summary">
          <h4>Summary</h4>
          {cart.map((i) => <div key={i._id} className="row sum-row"><span>{i.name} × {i.qty}</span><span>${(i.price * i.qty).toLocaleString()}</span></div>)}
          <div className="row sum-total"><span>Total</span><strong className="gold">${subtotal.toLocaleString()}</strong></div>
        </div>
      </div>
    </section>
  );
}
