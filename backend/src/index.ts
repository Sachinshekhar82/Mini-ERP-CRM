import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import productRoutes from './routes/products';
import stockRoutes from './routes/stock';
import challanRoutes from './routes/challans';
import dashboardRoutes from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for image uploads
app.use('/uploads', express.static(uploadDir));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Mini ERP + CRM Operations Portal API',
    time: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Mini ERP + CRM Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
