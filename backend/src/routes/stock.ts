import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';
import { stockInSchema, stockOutSchema } from '../validators/inventoryValidator';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// POST /api/inventory/stock-in (ADMIN, WAREHOUSE)
router.post(
  '/stock-in',
  requireRole('ADMIN', 'WAREHOUSE'),
  validateRequest(stockInSchema),
  InventoryController.stockIn
);

// POST /api/inventory/stock-out (ADMIN, WAREHOUSE)
router.post(
  '/stock-out',
  requireRole('ADMIN', 'WAREHOUSE'),
  validateRequest(stockOutSchema),
  InventoryController.stockOut
);

// GET /api/inventory/movements & /logs (ADMIN, WAREHOUSE)
router.get(
  '/movements',
  requireRole('ADMIN', 'WAREHOUSE'),
  InventoryController.getMovements
);

router.get(
  '/logs',
  requireRole('ADMIN', 'WAREHOUSE'),
  InventoryController.getMovements
);

export default router;
