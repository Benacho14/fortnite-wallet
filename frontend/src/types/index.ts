export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Account {
  balance: string;
}

export interface Transaction {
  id: string;
  amount: string;
  type: string;
  description: string | null;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    email: string;
  } | null;
  receiver?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface Store {
  id: string;
  name: string;
  description: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  store: {
    id: string;
    name: string;
    owner: {
      id: string;
      name: string;
    };
  };
}

export interface Order {
  id: string;
  quantity: number;
  totalPrice: string;
  createdAt: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    store: {
      name: string;
      owner: {
        id: string;
        name: string;
        email: string;
      };
    };
  };
}

export interface UserWithBalance {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  account: {
    balance: string;
  } | null;
}
