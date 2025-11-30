import { Router } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { registerSchema, loginSchema } from '../validators/schemas';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const result = await registerUser(email, password, name);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
