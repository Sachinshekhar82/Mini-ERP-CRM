import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import customerRoutes from './routes/customers';
import productRoutes from './routes/products';
import stockRoutes from './routes/stock';
import challanRoutes from './routes/challans';
import dashboardRoutes from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS configuration for production Vercel & local development
const corsOrigins = env.CORS_ORIGIN === '*' 
  ? '*' 
  : env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Production Health check endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API is healthy',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', stockRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;
