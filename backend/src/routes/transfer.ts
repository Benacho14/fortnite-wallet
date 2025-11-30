import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { transferLimiter } from '../middleware/rateLimiter';
import { transferFunds } from '../services/transferService';
import { transferSchema } from '../validators/schemas';

const router = Router();

router.post('/', authenticate, transferLimiter, async (req, res, next) => {
  try {
    const { receiverEmail, amount, description } = transferSchema.parse(req.body);
    const result = await transferFunds(req.user!.userId, receiverEmail, amount, description);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
