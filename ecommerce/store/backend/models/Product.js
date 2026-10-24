import mongoose from 'mongoose';

export default mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  stock: { type: Number, default: 20 },
  rating: { type: Number, default: 4.8 },
  featured: { type: Boolean, default: false },
}, { timestamps: true }));
