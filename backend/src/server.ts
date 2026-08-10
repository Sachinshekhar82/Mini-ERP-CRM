import app from './app';
import { env, validateEnv } from './config/env';

// Validate required environment variables before boot
validateEnv();

const parsedPort = parseInt(env.PORT, 10);
const PORT = isNaN(parsedPort) ? 5000 : parsedPort;

const server = app.listen(PORT, () => {
  console.log(`🚀 Mini ERP + CRM Server running in [${env.NODE_ENV}] mode on port ${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  server.close(() => process.exit(1));
});

export default server;
