import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

// Temporary setup endpoint - REMOVE AFTER FIRST USE
router.post('/initialize', async (req, res) => {
  try {
    console.log('🚀 Starting database initialization...');

    // Run migrations
    console.log('📦 Running Prisma migrations...');
    const migrateResult = await execAsync('npx prisma migrate deploy');
    console.log(migrateResult.stdout);

    // Run seed
    console.log('🌱 Seeding database...');
    const seedResult = await execAsync('npm run seed');
    console.log(seedResult.stdout);

    res.json({
      success: true,
      message: 'Database initialized successfully!',
      migrations: migrateResult.stdout,
      seed: seedResult.stdout,
    });
  } catch (error: any) {
    console.error('❌ Setup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Setup failed',
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr,
    });
  }
});

// Health check
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Setup endpoint is ready. POST to /api/setup/initialize to run migrations and seed.',
  });
});

export default router;
