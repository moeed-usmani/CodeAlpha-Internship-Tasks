export const AUTHOR_FIELDS = 'name username avatar color';

export const publicUser = (u, { withEmail = false } = {}) => ({
  _id: u._id,
  name: u.name,
  username: u.username,
  bio: u.bio,
  avatar: u.avatar,
  color: u.color,
  followersCount: (u.followers || []).length,
  followingCount: (u.following || []).length,
  createdAt: u.createdAt,
  ...(withEmail ? { email: u.email } : {}),
});

export const shapePost = (p, viewerId) => ({
  _id: p._id,
  text: p.text,
  image: p.image,
  color: p.color,
  createdAt: p.createdAt,
  author: p.author,
  likes: (p.likes || []).length,
  liked: viewerId ? (p.likes || []).some((id) => String(id) === String(viewerId)) : false,
  comments: p.commentCount || 0,
});
