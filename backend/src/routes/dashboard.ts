import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// GET /api/dashboard/stats (ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get(
  '/stats',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  DashboardController.getStats
);

export default router;
