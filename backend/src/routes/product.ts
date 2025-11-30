import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createProduct, getProducts } from '../services/storeService';
import { createProductSchema } from '../validators/schemas';

const router = Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description, price, stock } = createProductSchema.parse(req.body);
    const { storeId } = req.body;

    if (!storeId) {
      return res.status(400).json({ error: 'storeId is required' });
    }

    const product = await createProduct(
      req.user!.userId,
      storeId,
      name,
      price,
      stock,
      description
    );
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

export default router;
