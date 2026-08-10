import { Router } from 'express';
import { ChallanController } from '../controllers/challanController';
import { createChallanSchema, updateChallanSchema } from '../validators/challanValidator';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// GET /api/challans (ADMIN, SALES, ACCOUNTS, WAREHOUSE)
router.get(
  '/',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'),
  ChallanController.getChallans
);

// POST /api/challans (ADMIN, SALES)
router.post(
  '/',
  requireRole('ADMIN', 'SALES'),
  validateRequest(createChallanSchema),
  ChallanController.createChallan
);

// GET /api/challans/:id (ADMIN, SALES, ACCOUNTS, WAREHOUSE)
router.get(
  '/:id',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'),
  ChallanController.getChallanById
);

// PUT /api/challans/:id (ADMIN, SALES)
router.put(
  '/:id',
  requireRole('ADMIN', 'SALES'),
  validateRequest(updateChallanSchema),
  ChallanController.updateChallan
);

// POST /api/challans/:id/confirm (ADMIN, SALES, ACCOUNTS)
router.post(
  '/:id/confirm',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  ChallanController.confirmChallan
);

// POST /api/challans/:id/cancel (ADMIN, SALES, ACCOUNTS)
router.post(
  '/:id/cancel',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  ChallanController.cancelChallan
);

// GET /api/challans/:id/pdf (ADMIN, SALES, ACCOUNTS, WAREHOUSE)
router.get(
  '/:id/pdf',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'),
  ChallanController.generatePDF
);

export default router;
