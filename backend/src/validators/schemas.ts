import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const transferSchema = z.object({
  receiverEmail: z.string().email('Invalid receiver email'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

export const createStoreSchema = z.object({
  name: z.string().min(3, 'Store name must be at least 3 characters'),
  description: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock must be non-negative'),
});

export const purchaseSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const reversalSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});
