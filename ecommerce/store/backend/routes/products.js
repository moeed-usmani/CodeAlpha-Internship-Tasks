import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { category, q, sort } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    const sortMap = { 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, rating: { rating: -1 } };
    res.json(await Product.find(filter).sort(sortMap[sort] || { createdAt: -1 }));
  } catch (e) { next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const p = await Product.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ message: 'Product not found' });
    const related = await Product.find({ category: p.category, _id: { $ne: p._id } }).limit(4);
    res.json({ product: p, related });
  } catch (e) { next(e); }
});

export default router;
