import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'mini_erp_crm_jwt_secret_key_2026_super_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

export function validateEnv(): void {
  const required: (keyof typeof env)[] = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'PORT',
    'CORS_ORIGIN',
  ];
  const missing: string[] = [];

  for (const key of required) {
    if (!env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Environment Validation Error: Missing required variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ Environment configuration validated successfully.');
}
