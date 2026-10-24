import mongoose from 'mongoose';

export default mongoose.model('Post', new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, default: '', maxlength: 500, trim: true },
  image: { type: String, default: '' },
  color: { type: String, default: '#ffffff' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
}, { timestamps: true }));
