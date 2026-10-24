import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
dotenv.config();

const people = [
  ['Zara Khan', 'zara', 'Chasing sunsets & shipping side projects 🌅', '🦄', '#ff5fa2'],
  ['Ali Raza', 'aliraza', 'Full-stack dev. Chai > coffee ☕', '🚀', '#3a86ff'],
  ['Maya Lin', 'maya', 'Illustrator. Pixels, paper, plants 🌿', '🌸', '#06d6a0'],
  ['Omar Sheikh', 'omar', 'Gym, code, repeat 💪', '🔥', '#ff7b3a'],
  ['Sana Malik', 'sana', 'Books, bakes and bad puns 🍪', '🍕', '#ffd23f'],
  ['Dev Patel', 'devp', 'Music producer in the making 🎧', '🎧', '#b794f6'],
  ['Noor Fatima', 'noor', 'Travel notes from everywhere ✈️', '🌈', '#ffd23f'],
  ['Kai Tanaka', 'kai', 'Ramen reviewer. Strictly serious.', '👾', '#3a86ff'],
];
const posts = [
  ['zara', 'First post on Orbit! The colours here are unreal 🎨', '#ffd23f'],
  ['aliraza', 'Shipped my internship project today. Mongo + Express + React = ❤️', '#3a86ff'],
  ['maya', 'Sketching a new sticker pack. Which one should I draw next: cat or cactus?', '#06d6a0'],
  ['omar', 'Leg day done. Walking is now a negotiation.', '#ff7b3a'],
  ['sana', 'Baked cookies at 2am. No regrets. 🍪', '#ff5fa2'],
  ['devp', 'New beat dropping this weekend. Headphones recommended 🎧', '#b794f6'],
  ['noor', 'Golden hour hits different in the mountains ⛰️', '#ffffff'],
  ['kai', 'Rated 14 ramen bowls this month. The broth is the whole story.', '#ffffff'],
  ['zara', 'Hot take: dark mode is great, but bright neon UIs are more fun.', '#ff5fa2'],
  ['aliraza', 'Debugging tip: console.log is undefeated.', '#ffffff'],
  ['maya', 'Plant update: the monstera finally grew a new leaf 🌱', '#06d6a0'],
  ['sana', 'Recommend me a book that makes you cry and laugh in the same chapter.', '#ffd23f'],
];

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany({}), Post.deleteMany({}), Comment.deleteMany({})]);

const users = {};
for (const [name, username, bio, avatar, color] of people) {
  users[username] = await User.create({ name, username, email: `${username}@orbit.dev`, password: 'password123', bio, avatar, color });
}
const names = Object.keys(users);
// random follows
for (const a of names) for (const b of names) {
  if (a !== b && Math.random() < 0.45) {
    await User.updateOne({ _id: users[a]._id }, { $addToSet: { following: users[b]._id } });
    await User.updateOne({ _id: users[b]._id }, { $addToSet: { followers: users[a]._id } });
  }
}
const created = [];
let t = Date.now() - posts.length * 3600e3;
for (const [u, text, color] of posts) {
  const likes = names.filter((n) => n !== u && Math.random() < 0.5).map((n) => users[n]._id);
  created.push(await Post.create({ author: users[u]._id, text, color, likes, createdAt: new Date(t), updatedAt: new Date(t) }));
  t += 3600e3;
}
const chat = ['Love this!', 'Same here 😂', 'This is so true', 'Great vibes ✨', 'Need more of this', 'Haha yes!'];
for (const p of created) {
  const n = Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const who = names[Math.floor(Math.random() * names.length)];
    await Comment.create({ post: p._id, author: users[who]._id, text: chat[Math.floor(Math.random() * chat.length)] });
    await Post.updateOne({ _id: p._id }, { $inc: { commentCount: 1 } });
  }
}
console.log(`Seeded ${names.length} users and ${created.length} posts. Demo login: zara@orbit.dev / password123`);
process.exit(0);
