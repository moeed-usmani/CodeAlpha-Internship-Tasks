import mongoose from 'mongoose';

export default mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, image: String, price: Number, qty: Number,
  }],
  shipping: { fullName: String, address: String, city: String, phone: String },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Processing', 'Shipped', 'Delivered'], default: 'Processing' },
}, { timestamps: true }));
