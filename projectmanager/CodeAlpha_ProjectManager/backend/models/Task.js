import mongoose from 'mongoose';

export const STATUSES = ['todo', 'progress', 'review', 'done'];

export default mongoose.model('Task', new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, default: '', maxlength: 2000 },
  status: { type: String, enum: STATUSES, default: 'todo' },
  order: { type: Number, default: 0 },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date, default: null },
  labels: [{ type: String, trim: true, maxlength: 20 }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true }));
