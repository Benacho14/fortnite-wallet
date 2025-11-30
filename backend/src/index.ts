import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { initializeWebSocket } from './utils/websocket';

// Import routes
import authRoutes from './routes/auth';
import accountRoutes from './routes/account';
import transferRoutes from './routes/transfer';
import storeRoutes from './routes/store';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import adminRoutes from './routes/admin';
import setupRoutes from './routes/setup';

const app = express();
const server = createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/setup', setupRoutes);

// Error handler (must be last)
app.use(errorHandler);

server.listen(env.PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🏦 Virtual Wallet API Server       ║
  ╠═══════════════════════════════════════╣
  ║   Port: ${env.PORT}                       ║
  ║   Environment: ${env.NODE_ENV}         ║
  ║   WebSocket: Enabled                  ║
  ╚═══════════════════════════════════════╝
  `);
});

export default app;
