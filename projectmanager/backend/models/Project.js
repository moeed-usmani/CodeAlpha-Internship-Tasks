import mongoose from 'mongoose';

export default mongoose.model('Project', new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  description: { type: String, default: '', maxlength: 240 },
  emoji: { type: String, default: '🚀' },
  color: { type: String, default: '#6a4cff' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }));
