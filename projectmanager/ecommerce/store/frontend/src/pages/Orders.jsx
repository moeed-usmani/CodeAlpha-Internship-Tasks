import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../api.js';

export default function Orders() {
  const { auth } = useStore();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { if (auth) api.myOrders(auth.token).then(setOrders).catch((e) => setError(e.message)); }, [auth]);

  if (!auth) return <Navigate to="/login" state={{ from: '/orders' }} replace />;
  return (
    <section className="section page-top">
      <div className="section-head"><p className="eyebrow">Account</p><h2>Order history</h2></div>
      {error && <p className="error center">{error}</p>}
      {!orders ? <p className="muted center">Loading…</p> : !orders.length ? <p className="muted center">No orders yet. <Link to="/shop" className="gold">Start shopping</Link></p> :
        <div className="stack wide">
          {orders.map((o) => (
            <div key={o._id} className="order">
              <div className="row"><strong>#{o._id.slice(-8).toUpperCase()}</strong><span className="status">{o.status}</span></div>
              <p className="muted small">{new Date(o.createdAt).toLocaleString()} · {o.shipping.city}</p>
              {o.items.map((i, k) => <div key={k} className="row sum-row"><span>{i.name} × {i.qty}</span><span>${(i.price * i.qty).toLocaleString()}</span></div>)}
              <div className="row sum-total"><span>Total</span><strong className="gold">${o.total.toLocaleString()}</strong></div>
            </div>
          ))}
        </div>}
    </section>
  );
}
