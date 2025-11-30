import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getBalance, getTransactionHistory, getAccountDetails } from '../services/accountService';

const router = Router();

router.get('/balance', authenticate, async (req, res, next) => {
  try {
    const balance = await getBalance(req.user!.userId);
    res.json(balance);
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', authenticate, async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const transactions = await getTransactionHistory(req.user!.userId, limit);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.get('/details', authenticate, async (req, res, next) => {
  try {
    const details = await getAccountDetails(req.user!.userId);
    res.json(details);
  } catch (error) {
    next(error);
  }
});

router.get('/users', authenticate, async (req, res, next) => {
  try {
    const prisma = (await import('../config/database')).default;
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user!.userId },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
