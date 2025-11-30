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

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const prisma = (await import('../config/database')).default;
    const { name, description, price, stock } = createProductSchema.parse(req.body);

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { store: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.store.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, description, price, stock },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            owner: {
              select: { id: true, name: true },
            },
          },
        },
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

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { store: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.store.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
