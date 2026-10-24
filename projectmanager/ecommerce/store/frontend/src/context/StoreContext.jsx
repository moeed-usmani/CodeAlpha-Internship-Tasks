import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => read('aurum_cart', []));
  const [auth, setAuth] = useState(() => read('aurum_auth', null));
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { try { localStorage.setItem('aurum_cart', JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { try { localStorage.setItem('aurum_auth', JSON.stringify(auth)); } catch {} }, [auth]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2200); return () => clearTimeout(t); } }, [toast]);

  const addToCart = useCallback((p, qty = 1) => {
    setCart((c) => {
      const found = c.find((i) => i._id === p._id);
      if (found) return c.map((i) => (i._id === p._id ? { ...i, qty: Math.min(i.qty + qty, p.stock || 99) } : i));
      return [...c, { _id: p._id, name: p.name, price: p.price, image: p.image, slug: p.slug, stock: p.stock, qty }];
    });
    setToast(`${p.name} added to cart`);
    setCartOpen(true);
  }, []);

  const setQty = (id, qty) => setCart((c) => c.map((i) => (i._id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || 99)) } : i)));
  const removeItem = (id) => setCart((c) => c.filter((i) => i._id !== id));
  const clearCart = () => setCart([]);
  const logout = () => setAuth(null);

  const count = cart.reduce((n, i) => n + i.qty, 0);
  const subtotal = cart.reduce((n, i) => n + i.qty * i.price, 0);

  return (
    <Ctx.Provider value={{ cart, count, subtotal, addToCart, setQty, removeItem, clearCart, auth, setAuth, logout, cartOpen, setCartOpen, toast, setToast }}>
      {children}
    </Ctx.Provider>
  );
}
