import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { getAllUsers, getAllTransactions, getAllOrders, reverseTransaction } from '../services/adminService';
import { reversalSchema } from '../validators/schemas';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/users', async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const transactions = await getAllTransactions(limit);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const orders = await getAllOrders(limit);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.post('/reverse-transaction', async (req, res, next) => {
  try {
    const { transactionId, reason } = reversalSchema.parse(req.body);
    const result = await reverseTransaction(transactionId, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
