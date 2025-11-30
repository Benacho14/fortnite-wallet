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

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const prisma = (await import('../config/database')).default;
    const { name, description } = createStoreSchema.parse(req.body);

    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (store.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.store.update({
      where: { id: req.params.id },
      data: { name, description },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { products: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const prisma = (await import('../config/database')).default;

    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (store.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.store.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
