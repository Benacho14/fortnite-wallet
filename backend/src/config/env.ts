import dotenv from 'dotenv';

dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Validate required env vars
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set, using default');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'default-secret-change-me') {
  console.warn('⚠️  JWT_SECRET not set or using default - CHANGE IN PRODUCTION!');
}
