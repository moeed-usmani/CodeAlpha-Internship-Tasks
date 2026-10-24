let token = '';
export const setToken = (t) => { token = t || ''; };

const call = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const api = {
  register: (b) => call('/auth/register', { method: 'POST', body: b }),
  login: (b) => call('/auth/login', { method: 'POST', body: b }),
  feed: (scope) => call(`/posts?scope=${scope}`),
  createPost: (b) => call('/posts', { method: 'POST', body: b }),
  deletePost: (id) => call(`/posts/${id}`, { method: 'DELETE' }),
  like: (id) => call(`/posts/${id}/like`, { method: 'POST' }),
  comments: (id) => call(`/posts/${id}/comments`),
  addComment: (id, text) => call(`/posts/${id}/comments`, { method: 'POST', body: { text } }),
  deleteComment: (cid) => call(`/posts/comments/${cid}`, { method: 'DELETE' }),
  profile: (username) => call(`/users/${username}`),
  people: (username, type) => call(`/users/${username}/people?type=${type}`),
  follow: (id) => call(`/users/${id}/follow`, { method: 'POST' }),
  suggestions: () => call('/users/suggestions'),
  search: (q) => call(`/users/search?q=${encodeURIComponent(q)}`),
  updateMe: (b) => call('/users/me', { method: 'PUT', body: b }),
};
