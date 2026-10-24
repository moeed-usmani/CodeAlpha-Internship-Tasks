import { Router } from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shipping } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Cart is empty' });
    if (!shipping?.fullName || !shipping?.address || !shipping?.city || !shipping?.phone)
      return res.status(400).json({ message: 'Complete shipping details are required' });

    const lines = [];
    let total = 0;
    for (const it of items) {
      const p = await Product.findById(it.product);
      const qty = Math.max(1, parseInt(it.qty, 10) || 1);
      if (!p) return res.status(404).json({ message: 'A product in your cart no longer exists' });
      if (p.stock < qty) return res.status(400).json({ message: `Only ${p.stock} left of ${p.name}` });
      lines.push({ product: p._id, name: p.name, image: p.image, price: p.price, qty });
      total += p.price * qty;
    }
    for (const l of lines) await Product.updateOne({ _id: l.product }, { $inc: { stock: -l.qty } });
    res.status(201).json(await Order.create({ user: req.user._id, items: lines, shipping, total }));
  } catch (e) { next(e); }
});

router.get('/mine', protect, async (req, res, next) => {
  try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); }
  catch (e) { next(e); }
});

export default router;
