const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export const api = {
  // Auth
  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return handleResponse(response);
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  // Account
  getBalance: async () => {
    const response = await fetch(`${API_URL}/account/balance`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getTransactions: async (limit = 50) => {
    const response = await fetch(`${API_URL}/account/transactions?limit=${limit}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getAccountDetails: async () => {
    const response = await fetch(`${API_URL}/account/details`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Transfer
  transfer: async (receiverEmail: string, amount: number, description?: string) => {
    const response = await fetch(`${API_URL}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ receiverEmail, amount, description }),
    });
    return handleResponse(response);
  },

  // Stores
  getStores: async () => {
    const response = await fetch(`${API_URL}/stores`);
    return handleResponse(response);
  },

  createStore: async (name: string, description?: string) => {
    const response = await fetch(`${API_URL}/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(response);
  },

  // Products
  getProducts: async () => {
    const response = await fetch(`${API_URL}/products`);
    return handleResponse(response);
  },

  createProduct: async (storeId: string, name: string, price: number, stock: number, description?: string) => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ storeId, name, price, stock, description }),
    });
    return handleResponse(response);
  },

  // Orders
  buyProduct: async (productId: string, quantity: number) => {
    const response = await fetch(`${API_URL}/orders/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ productId, quantity }),
    });
    return handleResponse(response);
  },

  // Admin
  adminGetUsers: async () => {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  adminGetTransactions: async (limit = 100) => {
    const response = await fetch(`${API_URL}/admin/transactions?limit=${limit}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  adminGetOrders: async (limit = 100) => {
    const response = await fetch(`${API_URL}/admin/orders?limit=${limit}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  adminReverseTransaction: async (transactionId: string, reason: string) => {
    const response = await fetch(`${API_URL}/admin/reverse-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ transactionId, reason }),
    });
    return handleResponse(response);
  },
};
