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

// Permissive CORS configuration supporting Vercel previews & production domains
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests, mobile apps, or Postman (origin === undefined)
    if (!origin) return callback(null, true);
    
    if (env.CORS_ORIGIN === '*') return callback(null, true);

    const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    
    return callback(null, true); // Fallback allow to avoid preflight blocking
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Root welcome & API status endpoint
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    name: 'NEXORA Operations Portal Backend API',
    version: '1.0.0',
    status: 'ONLINE',
    documentation: 'https://github.com/Sachinshekhar82/Mini-ERP-CRM',
    healthCheck: '/api/health',
  });
});

// Production Health check endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API is healthy',
  });
});

// Primary API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', stockRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback Route Aliases (Handles missing /api in VITE_API_URL gracefully)
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/inventory', stockRoutes);
app.use('/stock', stockRoutes);
app.use('/challans', challanRoutes);
app.use('/dashboard', dashboardRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;
