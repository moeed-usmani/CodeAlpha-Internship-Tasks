import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { productImage } from '../utils.js';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeItem, subtotal } = useStore();
  const nav = useNavigate();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} />
          <motion.aside className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }}>
            <div className="drawer-head">
              <h3>Your Bag</h3>
              <button className="icon-btn" onClick={() => setCartOpen(false)}>✕</button>
            </div>
            <div className="drawer-body">
              {!cart.length && <p className="muted center">Your bag is empty.</p>}
              {cart.map((i) => (
                <motion.div layout key={i._id} className="cart-row">
                  <img src={productImage(i)} alt={i.name} />
                  <div>
                    <h4>{i.name}</h4>
                    <p className="gold">${i.price.toLocaleString()}</p>
                    <div className="qty">
                      <button onClick={() => setQty(i._id, i.qty - 1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => setQty(i._id, i.qty + 1)}>+</button>
                      <button className="remove" onClick={() => removeItem(i._id)}>Remove</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {!!cart.length && (
              <div className="drawer-foot">
                <div className="row"><span>Subtotal</span><strong>${subtotal.toLocaleString()}</strong></div>
                <button className="btn-gold full" onClick={() => { setCartOpen(false); nav('/checkout'); }}>Checkout</button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
