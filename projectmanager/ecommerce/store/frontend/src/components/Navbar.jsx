import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';

export default function Navbar() {
  const { count, setCartOpen, auth, logout } = useStore();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener('scroll', on);
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'nav-solid' : ''}`}>
      <Link to="/" className="logo">AURUM</Link>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/shop">Collection</NavLink>
        {auth && <NavLink to="/orders">Orders</NavLink>}
      </nav>
      <div className="nav-actions">
        {auth ? (
          <button className="link-btn" onClick={logout}>Hi, {auth.user.name.split(' ')[0]} · Logout</button>
        ) : (
          <Link to="/login" className="link-btn">Sign in</Link>
        )}
        <button className="cart-btn" onClick={() => setCartOpen(true)} aria-label="Open cart">
          Bag <span className="badge">{count}</span>
        </button>
      </div>
    </header>
  );
}
