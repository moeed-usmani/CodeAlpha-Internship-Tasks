import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9_]{3,20}$/ },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  bio: { type: String, default: '', maxlength: 160 },
  avatar: { type: String, default: '😎' },
  color: { type: String, default: '#ffd23f' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matches = function (pw) { return bcrypt.compare(pw, this.password); };

export default mongoose.model('User', userSchema);
