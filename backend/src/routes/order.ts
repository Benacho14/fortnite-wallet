import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { purchaseProduct } from '../services/storeService';
import { purchaseSchema } from '../validators/schemas';

const router = Router();

router.post('/buy', authenticate, async (req, res, next) => {
  try {
    const { productId, quantity } = purchaseSchema.parse(req.body);
    const result = await purchaseProduct(req.user!.userId, productId, quantity);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
