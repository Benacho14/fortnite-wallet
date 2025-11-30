import { AuthResponse, UserWithBalance, Transaction, Order, Product, Store } from '../types';

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
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return handleResponse<AuthResponse>(response);
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(response);
  },

  // Account
  getBalance: async (): Promise<{ balance: string }> => {
    const response = await fetch(`${API_URL}/account/balance`, {
      headers: getAuthHeader(),
    });
    return handleResponse<{ balance: string }>(response);
  },

  getTransactions: async (limit = 50): Promise<Transaction[]> => {
    const response = await fetch(`${API_URL}/account/transactions?limit=${limit}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<Transaction[]>(response);
  },

  getAccountDetails: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/account/details`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any>(response);
  },

  // Transfer
  transfer: async (receiverEmail: string, amount: number, description?: string): Promise<any> => {
    const response = await fetch(`${API_URL}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ receiverEmail, amount, description }),
    });
    return handleResponse<any>(response);
  },

  // Stores
  getStores: async (): Promise<Store[]> => {
    const response = await fetch(`${API_URL}/stores`);
    return handleResponse<Store[]>(response);
  },

  createStore: async (name: string, description?: string): Promise<Store> => {
    const response = await fetch(`${API_URL}/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ name, description }),
    });
    return handleResponse<Store>(response);
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/products`);
    return handleResponse<Product[]>(response);
  },

  createProduct: async (storeId: string, name: string, price: number, stock: number, description?: string): Promise<Product> => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ storeId, name, price, stock, description }),
    });
    return handleResponse<Product>(response);
  },

  // Orders
  buyProduct: async (productId: string, quantity: number): Promise<Order> => {
    const response = await fetch(`${API_URL}/orders/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ productId, quantity }),
    });
    return handleResponse<Order>(response);
  },

  // Admin
  adminGetUsers: async (): Promise<UserWithBalance[]> => {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getAuthHeader(),
    });
    return handleResponse<UserWithBalance[]>(response);
  },

  adminGetTransactions: async (limit = 100): Promise<Transaction[]> => {
    const response = await fetch(`${API_URL}/admin/transactions?limit=${limit}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<Transaction[]>(response);
  },

  adminGetOrders: async (limit = 100): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/admin/orders?limit=${limit}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<Order[]>(response);
  },

  adminReverseTransaction: async (transactionId: string, reason: string): Promise<any> => {
    const response = await fetch(`${API_URL}/admin/reverse-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ transactionId, reason }),
    });
    return handleResponse<any>(response);
  },
};
