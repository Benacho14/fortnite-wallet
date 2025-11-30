import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createStore, getStores, getStoreById } from '../services/storeService';
import { createStoreSchema } from '../validators/schemas';

const router = Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description } = createStoreSchema.parse(req.body);
    const store = await createStore(req.user!.userId, name, description);
    res.status(201).json(store);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const stores = await getStores();
    res.json(stores);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const store = await getStoreById(req.params.id);
    res.json(store);
  } catch (error) {
    next(error);
  }
});

export default router;
