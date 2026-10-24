const call = async (path, { method = 'GET', body, token } = {}) => {
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
  products: (params = {}) => call(`/products?${new URLSearchParams(params)}`),
  product: (slug) => call(`/products/${slug}`),
  register: (body) => call('/auth/register', { method: 'POST', body }),
  login: (body) => call('/auth/login', { method: 'POST', body }),
  placeOrder: (body, token) => call('/orders', { method: 'POST', body, token }),
  myOrders: (token) => call('/orders/mine', { token }),
};
