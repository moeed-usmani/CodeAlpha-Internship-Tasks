import mongoose from 'mongoose';

export default mongoose.model('Meeting', new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: 'Untitled meeting', maxlength: 60 },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }));
