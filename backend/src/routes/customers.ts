import { Router } from 'express';
import { CustomerController } from '../controllers/customerController';
import {
  createCustomerSchema,
  updateCustomerSchema,
  addFollowUpSchema,
} from '../validators/customerValidator';
import { validateRequest } from '../middleware/validate';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Apply authentication to all customer routes
router.use(authenticateJWT);

// GET /api/customers (ADMIN, SALES, ACCOUNTS)
router.get(
  '/',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  CustomerController.getCustomers
);

// POST /api/customers (ADMIN, SALES)
router.post(
  '/',
  requireRole('ADMIN', 'SALES'),
  validateRequest(createCustomerSchema),
  CustomerController.createCustomer
);

// GET /api/customers/:id (ADMIN, SALES, ACCOUNTS)
router.get(
  '/:id',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  CustomerController.getCustomerById
);

// PUT /api/customers/:id (ADMIN, SALES)
router.put(
  '/:id',
  requireRole('ADMIN', 'SALES'),
  validateRequest(updateCustomerSchema),
  CustomerController.updateCustomer
);

// DELETE /api/customers/:id (ADMIN Only)
router.delete(
  '/:id',
  requireRole('ADMIN'),
  CustomerController.deleteCustomer
);

// POST /api/customers/:id/follow-ups & /notes (ADMIN, SALES)
router.post(
  '/:id/follow-ups',
  requireRole('ADMIN', 'SALES'),
  validateRequest(addFollowUpSchema),
  CustomerController.addFollowUp
);

router.post(
  '/:id/notes',
  requireRole('ADMIN', 'SALES'),
  validateRequest(addFollowUpSchema),
  CustomerController.addFollowUp
);

// GET /api/customers/:id/follow-ups (ADMIN, SALES, ACCOUNTS)
router.get(
  '/:id/follow-ups',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  CustomerController.getFollowUps
);

export default router;
