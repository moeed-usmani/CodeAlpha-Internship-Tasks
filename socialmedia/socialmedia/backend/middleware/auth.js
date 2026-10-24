import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const load = async (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const { id } = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  return User.findById(id).select('-password');
};

export const protect = async (req, res, next) => {
  try {
    req.user = await load(req);
    if (!req.user) return res.status(401).json({ message: 'Please sign in first' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Login ho to req.user set karta hai, warna bhi aage jaane deta hai
export const optionalAuth = async (req, _res, next) => {
  try { req.user = await load(req); } catch { req.user = null; }
  next();
};
